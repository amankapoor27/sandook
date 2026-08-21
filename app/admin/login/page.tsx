import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Admin access for uploading gallery images.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </main>
  );
}
