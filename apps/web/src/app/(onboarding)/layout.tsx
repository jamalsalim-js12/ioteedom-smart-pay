import type { ReactNode } from "react";
import { AuthShell } from "@/components/auth/brand-pane";

export default function OnboardingGroupLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
