import type { ReactNode } from "react";

export function Facts({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 px-5 py-4 font-mono text-xs">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="text-mute">{row.label}</dt>
          <dd className="min-w-0">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
