import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div>Dashboard Layout</div>
      {children}
    </div>
  );
}
