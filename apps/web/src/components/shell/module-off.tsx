"use client";

import Link from "next/link";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";

export function ModuleOff({
  name,
  href = "/services",
}: {
  name: string;
  href?: string;
}) {
  return (
    <Panel className="mx-6 mt-6">
      <EmptyState
        icon={Power}
        title={`${name} is not on this account`}
        body="IoTeedom hasn’t switched this module on. Ask ops if you need it. The rest of the dashboard stays as-is."
      >
        <Link href={href} className="inline-flex">
          <Button intent="ink">See what’s on</Button>
        </Link>
      </EmptyState>
    </Panel>
  );
}
