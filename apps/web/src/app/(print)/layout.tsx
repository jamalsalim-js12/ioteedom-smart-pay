import type { ReactNode } from "react";

export default function PrintLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh bg-field">{children}</div>;
}
