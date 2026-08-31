"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "./AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <div className="admin-theme flex min-h-full flex-1 flex-col">
      {!isLogin && <AdminNav />}
      <div className="flex flex-1 flex-col px-6 py-8">{children}</div>
    </div>
  );
}
