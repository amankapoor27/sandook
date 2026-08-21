export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500">Sandook Admin</p>
      </header>
      <div className="flex flex-1 flex-col px-6 py-8">{children}</div>
    </div>
  );
}
