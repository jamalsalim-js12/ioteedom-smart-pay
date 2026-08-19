"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  meterDaily,
  monthlyUsage,
  roomsEnergy,
  solarSeries,
  spendMix,
  temperatureLog,
  evWeekly,
  type UsageMonth,
} from "@/data/demo";

function Tip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
        {label}
      </p>
      {payload.map((item) => (
        <p key={item.name} className="tabular">
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export function UsageChart({ data = monthlyUsage }: { data?: UsageMonth[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="kwh" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="water" orientation="right" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Bar yAxisId="kwh" dataKey="kwh" name="kWh" fill="var(--color-live)" radius={[4, 4, 0, 0]} />
        <Line yAxisId="water" type="monotone" dataKey="water" name="m³" stroke="var(--color-water)" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function SpendChart({
  data = spendMix,
}: {
  data?: { name: string; value: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={58}
          outerRadius={84}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<Tip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MeterChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={meterDaily} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="day" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Bar dataKey="m3" name="m³" radius={[4, 4, 0, 0]}>
          {meterDaily.map((entry) => (
            <Cell
              key={entry.day}
              fill={entry.note === "spike" ? "var(--color-alert)" : "var(--color-water)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SolarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={solarSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="hour" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Area type="monotone" dataKey="produce" name="Produced kWh" stroke="var(--color-solar)" fill="var(--color-solar)" fillOpacity={0.25} />
        <Area type="monotone" dataKey="use" name="Used kWh" stroke="var(--color-ink)" fill="var(--color-ink)" fillOpacity={0.08} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function SpendTrendChart({ data = monthlyUsage }: { data?: UsageMonth[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="month" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Area
          type="monotone"
          dataKey="spend"
          name="GH₵"
          stroke="var(--color-live)"
          fill="var(--color-live)"
          fillOpacity={0.22}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function UnitsChart({
  units,
}: {
  units: { name: string; ecgDue: number; waterDue: number }[];
}) {
  const data = units.map((unit) => ({
    name: unit.name.replace("Unit ", "U"),
    ECG: unit.ecgDue,
    Water: unit.waterDue,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Bar dataKey="ECG" stackId="dues" fill="var(--color-live)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Water" stackId="dues" fill="var(--color-water)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EvChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={evWeekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Bar dataKey="kwh" name="kWh" fill="var(--color-grid)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function RoomsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={roomsEnergy} layout="vertical" margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="room" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
        <Tooltip content={<Tip />} />
        <Bar dataKey="kwh" name="kWh" fill="var(--color-brass)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ClimateChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={temperatureLog} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="hour" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="t" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="c" orientation="right" tick={{ fill: "var(--color-mute)", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip content={<Tip />} />
        <Line yAxisId="t" type="monotone" dataKey="temp" name="°C" stroke="var(--color-live)" strokeWidth={2} dot={false} />
        <Line yAxisId="c" type="monotone" dataKey="co2" name="CO₂ ppm" stroke="var(--color-water)" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
