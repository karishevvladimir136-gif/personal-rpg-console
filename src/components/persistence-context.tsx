"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./language-context";
import {
  loadCampaign,
  loadWorkspace,
  saveMutation,
  errorMessage,
} from "@/lib/persistence/client";
import type {
  CampaignSnapshot,
  Mutation,
  MutationResult,
  Workspace,
} from "@/lib/persistence/contracts";

import {
  installDraftNavigationGuard,
  registerDirtyDraft,
} from "@/lib/persistence/navigation-guard";

type DataState<T> = {
  data: T | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  mutate: (input: Mutation) => Promise<MutationResult>;
};
const WorkspaceContext = createContext<DataState<Workspace> | null>(null);
const CampaignContext = createContext<
  (DataState<CampaignSnapshot> & { campaignId: string }) | null
>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  useEffect(() => installDraftNavigationGuard(window), []);
  const pathname = usePathname();
  const enabled =
    !pathname.startsWith("/preview") &&
    pathname !== "/login" &&
    pathname !== "/setup";
  const [data, setData] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState("");
  const { setLanguage } = useLanguage();
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const next = await loadWorkspace();
      if (request === generation.current) {
        setData(next);
        setError("");
        setLanguage(next.preferences.language);
      }
    } catch (cause) {
      if (request === generation.current) {
        setError(errorMessage(cause));
      }
      throw cause;
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [setLanguage]);
  useEffect(() => {
    if (!enabled) return;
    void refresh().catch(() => {});
    const guard = generation;
    return () => {
      guard.current++;
    };
  }, [enabled, refresh, pathname]);
  const mutate = useCallback(
    async (input: Mutation) => {
      const result = await saveMutation(input);
      await refresh();
      return result;
    },
    [refresh],
  );
  return (
    <WorkspaceContext.Provider
      value={{ data, loading, error, refresh, mutate }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
export function CampaignDataProvider({
  campaignId,
  initialData,
  children,
}: {
  campaignId: string;
  initialData: CampaignSnapshot;
  children: ReactNode;
}) {
  const [data, setData] = useState<CampaignSnapshot | null>(initialData);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    setLoading(true);
    try {
      const next = await loadCampaign(campaignId);
      if (request === generation.current) {
        setData(next);
        setError("");
      }
    } catch (cause) {
      if (request === generation.current) setError(errorMessage(cause));
      throw cause;
    } finally {
      if (request === generation.current) setLoading(false);
    }
  }, [campaignId]);
  const mutate = useCallback(
    async (input: Mutation) => {
      if (!("campaignId" in input) || input.campaignId !== campaignId)
        throw new Error("Wrong campaign scope");
      const result = await saveMutation(input);
      await refresh();
      return result;
    },
    [campaignId, refresh],
  );
  return (
    <CampaignContext.Provider
      value={{ campaignId, data, loading, error, refresh, mutate }}
    >
      {children}
    </CampaignContext.Provider>
  );
}
export function useWorkspaceData() {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("WorkspaceProvider is required");
  return value;
}
export function useCampaignData() {
  const value = useContext(CampaignContext);
  if (!value) throw new Error("CampaignDataProvider is required");
  return value;
}
export function useOptionalCampaignData() {
  return useContext(CampaignContext);
}

export function useUnsavedChanges(dirty: boolean) {
  const { t } = useLanguage();
  const token = useRef(Symbol("draft"));
  useEffect(() => {
    if (!dirty) return;
    return registerDirtyDraft(token.current, () =>
      t("Leave this page and discard unsaved changes?"),
    );
  }, [dirty, t]);
}
