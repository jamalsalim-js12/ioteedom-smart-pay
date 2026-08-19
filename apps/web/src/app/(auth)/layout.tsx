import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/brand-pane";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthShell>{children}</AuthShell>;
}
