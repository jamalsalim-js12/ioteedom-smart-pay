"use client";

import { Zap } from "lucide-react";
import { toast } from "sonner";
import { ClimateChart, RoomsChart } from "@/components/charts/load";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { ModuleOff } from "@/components/shell/module-off";
import { Topbar } from "@/components/shell/topbar";
import { devices } from "@/data/demo";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";

export default function SmartHomePage() {
  const on = useDemoStore((s) => s.enabled.smartHome);
  const devicesOn = useDemoStore((s) => s.devicesOn);
  const toggleDevice = useDemoStore((s) => s.toggleDevice);
  const acTemp = useDemoStore((s) => s.acTemp);
  const setAcTemp = useDemoStore((s) => s.setAcTemp);
  const houseEvents = useDemoStore((s) => s.houseEvents);

  if (!on) {
    return (
      <div className="enter">
        <Topbar kicker="IoT kit" title="Smart home" />
        <ModuleOff name="Smart home" />
      </div>
    );
  }

  return (
    <div className="enter">
      <Topbar kicker="Sensors and control" title="Smart home" />
      <div className="grid gap-5 p-6 xl:grid-cols-2">
        <Panel className="xl:col-span-2">
          <PanelHeader eyebrow="House" title="Devices" />
          <ul className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => {
              const active = devicesOn[device.id];
              return (
                <li key={device.id} className="bg-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mute">
                        {device.room}
                      </p>
                      <p className="mt-1 font-medium">{device.name}</p>
                      <p className="mt-1 text-sm text-mute">
                        {device.kind === "lock"
                          ? active
                            ? "Locked"
                            : "Unlocked"
                          : device.kind === "light"
                            ? active
                              ? "On"
                              : "Off"
                            : device.kind === "climate"
                              ? active
                                ? `${acTemp}°C`
                                : "Off"
                              : device.detail}
                      </p>
                    </div>
                    {device.kind === "sensor" ? (
                      <span className="rounded-full bg-field px-2 py-1 font-mono text-[11px] text-mute">
                        Live
                      </span>
                    ) : device.kind === "lock" ? (
                      <Button
                        size="sm"
                        intent={active ? "ink" : "ghost"}
                        onClick={() => {
                          toggleDevice(device.id);
                          toast.success(active ? "Door unlocked" : "Door locked");
                        }}
                      >
                        {active ? "Unlock" : "Lock"}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        intent={active ? "ink" : "ghost"}
                        onClick={() => {
                          toggleDevice(device.id);
                          toast.success(`${device.name} ${active ? "off" : "on"}`);
                        }}
                      >
                        {active ? "Turn off" : "Turn on"}
                      </Button>
                    )}
                  </div>
                  {device.kind === "climate" && active ? (
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        intent="ghost"
                        onClick={() => {
                          setAcTemp(acTemp - 1);
                          toast.success(`AC ${acTemp - 1}°C`);
                        }}
                      >
                        −
                      </Button>
                      <span className="tabular text-sm">{acTemp}°C</span>
                      <Button
                        size="sm"
                        intent="ghost"
                        onClick={() => {
                          setAcTemp(acTemp + 1);
                          toast.success(`AC ${acTemp + 1}°C`);
                        }}
                      >
                        +
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Today" title="Energy by room" />
          <div className="h-72 px-2 pt-2 pb-4">
            <RoomsChart />
          </div>
        </Panel>

        <Panel>
          <PanelHeader eyebrow="Lounge air" title="Temperature and CO₂" />
          <div className="h-72 px-2 pt-2 pb-4">
            <ClimateChart />
          </div>
        </Panel>

        <Panel className="xl:col-span-2">
          <PanelHeader eyebrow="Tracking" title="What happened" />
          {houseEvents.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No events"
              body="Locks, lights, and climate will log here."
            />
          ) : (
            <ul>
              {houseEvents.map((event) => (
                <li
                  key={`${event.at}-${event.text}`}
                  className={cn(
                    "flex gap-4 border-b border-line px-5 py-3 last:border-0",
                  )}
                >
                  <p className="w-36 shrink-0 font-mono text-xs text-mute">
                    {event.at}
                  </p>
                  <p className="text-sm">{event.text}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
