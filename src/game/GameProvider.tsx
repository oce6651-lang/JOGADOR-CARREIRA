import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  acceptCareerOffer,
  acknowledgeSeasonSummary,
  attendCareerTrial,
  createCareer,
  declineCareerOffer,
  dismissCareerAgent,
  hireCareerAgent,
  negotiateCareerOffer,
  simulateCareer,
  type NegotiationFeedback,
  type NewCareerInput,
} from "./career";
import type { AgentTemplate, TrialOpportunity } from "./ai";
import type { NegotiationTopic } from "./types";
import type { SimulationScope } from "./simulation";
import {
  DEFAULT_SETTINGS,
  deleteCareer,
  loadCareer,
  loadSettings,
  saveCareer,
  saveSettings,
} from "./storage";
import type { Career, GameSettings, SimulationReport } from "./types";

interface GameContextValue {
  /** True once localStorage has been read on the client. */
  hydrated: boolean;
  career: Career | null;
  settings: GameSettings;
  /** Report of the last simulated period (not persisted). */
  lastReport: SimulationReport | null;
  simulating: boolean;
  startNewCareer: (input: NewCareerInput) => Career;
  updateCareer: (updater: (career: Career) => Career) => void;
  simulate: (scope: SimulationScope) => void;
  dismissReport: () => void;
  dismissSeasonSummary: (summaryId: string) => void;
  abandonCareer: () => void;
  /** Negotiations — every proposal is resolved by the player. */
  acceptOffer: (offerId: string) => void;
  negotiateOffer: (offerId: string, topic: NegotiationTopic) => NegotiationFeedback | null;
  declineOffer: (offerId: string) => void;
  attendTrial: (opportunity: TrialOpportunity) => boolean;
  hireAgent: (template: AgentTemplate) => void;
  dismissAgent: () => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [career, setCareer] = useState<Career | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [lastReport, setLastReport] = useState<SimulationReport | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    setCareer(loadCareer());
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Career | null) => {
    setCareer(next);
    if (next) saveCareer(next);
  }, []);

  const startNewCareer = useCallback(
    (input: NewCareerInput) => {
      const next = createCareer(input);
      setLastReport(null);
      persist(next);
      return next;
    },
    [persist],
  );

  const updateCareer = useCallback((updater: (career: Career) => Career) => {
    setCareer((prev) => {
      if (!prev) return prev;
      const next = { ...updater(prev), updatedAt: Date.now() };
      saveCareer(next);
      return next;
    });
  }, []);

  const simulate = useCallback((scope: SimulationScope) => {
    setSimulating(true);
    setCareer((prev) => {
      if (!prev) return prev;
      const { career: next, report } = simulateCareer(prev, scope);
      saveCareer(next);
      setLastReport(report);
      return next;
    });
    setSimulating(false);
  }, []);

  const acceptOffer = useCallback(
    (offerId: string) => updateCareer((prev) => acceptCareerOffer(prev, offerId)),
    [updateCareer],
  );

  const negotiateOffer = useCallback(
    (offerId: string, topic: NegotiationTopic) => {
      if (!career) return null;
      const feedback = negotiateCareerOffer(career, offerId, topic);
      persist(feedback.career);
      return feedback;
    },
    [career, persist],
  );

  const declineOffer = useCallback(
    (offerId: string) => updateCareer((prev) => declineCareerOffer(prev, offerId)),
    [updateCareer],
  );

  const attendTrial = useCallback(
    (opportunity: TrialOpportunity) => {
      if (!career) return false;
      const result = attendCareerTrial(career, opportunity);
      persist(result.career);
      return result.approved;
    },
    [career, persist],
  );

  const hireAgent = useCallback(
    (template: AgentTemplate) => updateCareer((prev) => hireCareerAgent(prev, template)),
    [updateCareer],
  );

  const dismissAgent = useCallback(
    () => updateCareer((prev) => dismissCareerAgent(prev)),
    [updateCareer],
  );

  const dismissReport = useCallback(() => setLastReport(null), []);

  const dismissSeasonSummary = useCallback(
    (summaryId: string) => {
      updateCareer((prev) => acknowledgeSeasonSummary(prev, summaryId));
    },
    [updateCareer],
  );

  const abandonCareer = useCallback(() => {
    deleteCareer();
    setCareer(null);
    setLastReport(null);
  }, []);

  const updateSettings = useCallback((patch: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      hydrated,
      career,
      settings,
      lastReport,
      simulating,
      startNewCareer,
      updateCareer,
      simulate,
      dismissReport,
      dismissSeasonSummary,
      abandonCareer,
      updateSettings,
      acceptOffer,
      negotiateOffer,
      declineOffer,
      attendTrial,
      hireAgent,
      dismissAgent,
    }),
    [
      hydrated,
      career,
      settings,
      lastReport,
      simulating,
      startNewCareer,
      updateCareer,
      simulate,
      dismissReport,
      dismissSeasonSummary,
      abandonCareer,
      updateSettings,
      acceptOffer,
      negotiateOffer,
      declineOffer,
      attendTrial,
      hireAgent,
      dismissAgent,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
