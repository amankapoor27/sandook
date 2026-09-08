/** Workers FormData entries may be Blob, not File — accept both. */
export function isUploadFile(entry: FormDataEntryValue): entry is File {
  if (entry instanceof File) return true;
  return (
    typeof Blob !== "undefined" &&
    entry instanceof Blob &&
    typeof (entry as File).name === "string" &&
    (entry as File).name.length > 0
  );
}

export function getUploadFiles(form: FormData): File[] {
  return form.getAll("file").filter(isUploadFile);
}
