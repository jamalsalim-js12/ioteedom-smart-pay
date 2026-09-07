"use client";

import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  getGetMeQueryKey,
  postAuthRefresh,
  useGetMe,
  usePostAuthLogout,
} from "@/api/generated/api";
import { ApiError, readAccessToken, setAccessToken } from "@/api/mutator";
import { demoPropertyId, SessionContext, type SessionPhase, sessionFromMe } from "@/lib/session";
import { useDemoStore } from "@/lib/store";

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const logout = usePostAuthLogout();
  const [phase, setPhase] = useState<SessionPhase>("boot");

  useEffect(() => {
    let cancelled = false;
    async function boot() {
      if (readAccessToken()) {
        if (!cancelled) setPhase("authed");
        return;
      }
      try {
        const tokens = await postAuthRefresh({});
        setAccessToken(tokens.accessToken);
        if (!cancelled) setPhase("authed");
      } catch {
        setAccessToken(null);
        if (!cancelled) setPhase("guest");
      }
    }
    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const me = useGetMe({
    query: {
      enabled: phase === "authed",
      retry: false,
      staleTime: 30_000,
    },
  });

  useEffect(() => {
    if (phase !== "authed" || !me.isError) return;
    if (me.error instanceof ApiError && me.error.status === 401) {
      setAccessToken(null);
      setPhase("guest");
    }
  }, [phase, me.isError, me.error]);

  const session = me.data ? sessionFromMe(me.data) : null;

  useEffect(() => {
    if (phase !== "authed" || me.isFetched !== true) return;
    if (me.data && sessionFromMe(me.data) === null) {
      setAccessToken(null);
      queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
      useDemoStore.setState({ session: null });
      setPhase("guest");
    }
  }, [phase, me.data, me.isFetched, queryClient]);

  useEffect(() => {
    if (phase !== "authed" || !session) return;
    const membership = session.memberships[0];
    const property = membership?.properties[0];
    useDemoStore.setState((state) => ({
      session: {
        role: session.role === "ops" ? "ops" : "household",
        name: session.name,
        phone: session.phoneDisplay,
        email: state.session?.email ?? "",
      },
      onboarded: session.onboarded,
      enabled: session.enabled,
      activePropertyId: membership
        ? demoPropertyId(membership.accountKind)
        : state.activePropertyId,
      profile: {
        ...state.profile,
        name: session.name,
        phone: session.phoneDisplay,
        property: property?.address ?? state.profile.property,
        city: property?.city ?? state.profile.city,
      },
    }));
  }, [phase, session]);

  const applyTokens = useCallback(
    (tokens: { accessToken: string }) => {
      setAccessToken(tokens.accessToken);
      setPhase("authed");
      void queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
    },
    [queryClient],
  );

  const signOut = useCallback(async () => {
    try {
      await logout.mutateAsync({});
    } catch {
      // Cookie/session is cleared locally either way.
    }
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
    useDemoStore.setState({ session: null });
    setPhase("guest");
  }, [logout, queryClient]);

  const isReady =
    phase === "guest" || (phase === "authed" && (me.isFetched || me.isError) && !me.isPending);

  const value = useMemo(
    () => ({
      phase,
      session,
      isReady: phase !== "boot" && isReady,
      applyTokens,
      signOut,
    }),
    [phase, session, isReady, applyTokens, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
