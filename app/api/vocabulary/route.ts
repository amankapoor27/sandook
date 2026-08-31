import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  addVocabularyCategory,
  addVocabularyStringEntry,
  getVocabulary,
  putVocabulary,
  reorderVocabularyCollection,
  setCategoryActive,
  setVocabularyEntryActive,
  syncVocabularyFromManifest,
  vocabularyForClient,
  type VocabularyListKey,
} from "@/lib/vocabulary";
import type { CategoryFieldSet } from "@/lib/types";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vocabulary = await syncVocabularyFromManifest();
  return NextResponse.json({ vocabulary: vocabularyForClient(vocabulary) });
}

type PatchBody =
  | {
      action: "hide" | "restore";
      list: VocabularyListKey;
      value: string;
    }
  | {
      action: "hide" | "restore";
      list: "categories";
      value: string;
    }
  | {
      action: "add";
      list: VocabularyListKey;
      value: string;
    }
  | {
      action: "add";
      list: "categories";
      label: string;
      fieldSet?: CategoryFieldSet;
    }
  | {
      action: "reorder";
      list: "collections";
      value: string;
      direction: "up" | "down";
    };

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    let vocabulary;

    if (body.action === "add") {
      if (body.list === "categories") {
        vocabulary = await addVocabularyCategory(
          body.label,
          body.fieldSet ?? "painting",
        );
      } else {
        vocabulary = await addVocabularyStringEntry(body.list, body.value);
      }
    } else if (body.action === "reorder") {
      if (body.list !== "collections") {
        return NextResponse.json({ error: "Invalid list" }, { status: 400 });
      }
      vocabulary = await reorderVocabularyCollection(body.value, body.direction);
    } else if (body.list === "categories") {
      vocabulary = await setCategoryActive(
        body.value,
        body.action === "restore",
      );
    } else {
      vocabulary = await setVocabularyEntryActive(
        body.list,
        body.value,
        body.action === "restore",
      );
    }

    return NextResponse.json({ vocabulary: vocabularyForClient(vocabulary) });
  } catch (error) {
    console.error("Vocabulary update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { vocabulary?: Awaited<ReturnType<typeof getVocabulary>> };
    if (!body.vocabulary) {
      return NextResponse.json({ error: "Missing vocabulary" }, { status: 400 });
    }
    const vocabulary = await putVocabulary(body.vocabulary);
    return NextResponse.json({ vocabulary: vocabularyForClient(vocabulary) });
  } catch (error) {
    console.error("Vocabulary replace failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
