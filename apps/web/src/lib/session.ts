"use client";

import { createContext, useContext } from "react";
import type {
  AuthTokensDto,
  MeMembershipDto,
  MeStaffResponseDto,
  MeUserResponseDto,
} from "@/api/generated/api";
import { blankModules, type PropertyId, type ServiceId } from "@/data/demo";

export type AppRole = "household" | "ops";

export type SessionView = {
  role: AppRole;
  id: string;
  name: string;
  phone: string;
  phoneDisplay: string;
  mustChangePin: boolean;
  onboarded: boolean;
  enabled: Record<ServiceId, boolean>;
  memberships: MeMembershipDto[];
};

export type SessionPhase = "boot" | "guest" | "authed";

export type SessionContextValue = {
  phase: SessionPhase;
  session: SessionView | null;
  isReady: boolean;
  applyTokens: (tokens: AuthTokensDto) => void;
  signOut: () => Promise<void>;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

const apiModuleToService: Record<string, ServiceId> = {
  ecg: "ecg",
  water: "water",
  utilities: "utilities",
  meters: "meters",
  smart_home: "smartHome",
  solar: "solar",
  ev: "ev",
};

const serviceToApiModule: Record<ServiceId, string> = {
  ecg: "ecg",
  water: "water",
  utilities: "utilities",
  meters: "meters",
  smartHome: "smart_home",
  solar: "solar",
  ev: "ev",
};

export function enabledFromModules(modules: Record<string, boolean>): Record<ServiceId, boolean> {
  const enabled = blankModules();
  for (const [key, on] of Object.entries(modules)) {
    const id = apiModuleToService[key];
    if (id) enabled[id] = on;
  }
  return enabled;
}

export function modulesToApi(modules: Record<ServiceId, boolean>): Record<string, boolean> {
  return Object.fromEntries(
    (Object.keys(serviceToApiModule) as ServiceId[]).map((id) => [
      serviceToApiModule[id],
      Boolean(modules[id]),
    ]),
  );
}

export function demoPropertyId(kind: "home" | "estate"): PropertyId {
  return kind === "estate" ? "airport" : "east-legon";
}

export function isMeUser(me: MeUserResponseDto | MeStaffResponseDto): me is MeUserResponseDto {
  return me.kind === "user";
}

export function sessionFromMe(me: MeUserResponseDto | MeStaffResponseDto): SessionView | null {
  if (!isMeUser(me)) {
    return {
      role: "ops",
      id: me.id,
      name: me.name,
      phone: me.phone,
      phoneDisplay: me.phoneDisplay,
      mustChangePin: me.mustChangePin,
      onboarded: true,
      enabled: blankModules(),
      memberships: [],
    };
  }

  const primary = me.memberships[0];
  if (!primary) return null;

  return {
    role: "household",
    id: me.id,
    name: me.name,
    phone: me.phone,
    phoneDisplay: me.phoneDisplay,
    mustChangePin: me.mustChangePin,
    onboarded: Boolean(primary.onboardedAt) || primary.status === "active",
    enabled: enabledFromModules(primary.modules),
    memberships: me.memberships,
  };
}

export function destinationFor(session: SessionView): string {
  if (session.mustChangePin) return "/pin";
  if (session.role === "ops") return "/admin";
  if (!session.onboarded) return "/onboarding";
  return "/";
}

export function useAuthSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within SessionProvider");
  }
  return ctx;
}

export function useEnabled(): Record<ServiceId, boolean> {
  const { session } = useAuthSession();
  return session?.enabled ?? blankModules();
}
