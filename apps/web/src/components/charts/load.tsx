"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";

function Frame({ children }: { children?: ReactNode }) {
  return (
    <div className="h-64 w-full animate-pulse rounded-xl bg-field" aria-hidden>
      {children}
    </div>
  );
}

export const UsageChart = dynamic(
  () => import("./charts").then((m) => m.UsageChart),
  { ssr: false, loading: () => <Frame /> },
);

export const SpendChart = dynamic(
  () => import("./charts").then((m) => m.SpendChart),
  { ssr: false, loading: () => <Frame /> },
);

export const MeterChart = dynamic(
  () => import("./charts").then((m) => m.MeterChart),
  { ssr: false, loading: () => <Frame /> },
);

export const SolarChart = dynamic(
  () => import("./charts").then((m) => m.SolarChart),
  { ssr: false, loading: () => <Frame /> },
);

export const SpendTrendChart = dynamic(
  () => import("./charts").then((m) => m.SpendTrendChart),
  { ssr: false, loading: () => <Frame /> },
);

export const UnitsChart = dynamic(
  () => import("./charts").then((m) => m.UnitsChart),
  { ssr: false, loading: () => <Frame /> },
);

export const EvChart = dynamic(
  () => import("./charts").then((m) => m.EvChart),
  { ssr: false, loading: () => <Frame /> },
);

export const RoomsChart = dynamic(
  () => import("./charts").then((m) => m.RoomsChart),
  { ssr: false, loading: () => <Frame /> },
);

export const ClimateChart = dynamic(
  () => import("./charts").then((m) => m.ClimateChart),
  { ssr: false, loading: () => <Frame /> },
);
