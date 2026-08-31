import { LoginForm } from "@/components/admin/LoginForm";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Admin access for uploading gallery images.
      </p>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
