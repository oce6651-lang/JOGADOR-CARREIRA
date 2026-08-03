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
  acceptCareerPromotion,
  declineCareerPromotion,
  acknowledgeSeasonSummary,
  attendCareerTrial,
  createCareer,
  declineCareerOffer,
  dismissCareerAgent,
  hireCareerAgent,
  negotiateCareerOffer,
  offerCareerToClub,
  requestCareerPromotion,
  simulateCareer,
  type NegotiationFeedback,
  type NewCareerInput,
} from "./career";
import type { AgentTemplate, TrialOpportunity } from "./ai";
import type { Club } from "./world";
import type { NegotiationTopic } from "./types";
import type { SimulationScope } from "./simulation";
import {
  DEFAULT_SETTINGS,
  deleteCareer,
  deleteCareerById,
  listSaves,
  loadCareer,
  loadCareerById,
  loadSettings,
  saveCareer,
  saveSettings,
  setActiveCareer,
} from "./storage";
import type { Career, CareerSummary, GameSettings, SimulationReport } from "./types";

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
  /** Agent offers the athlete to any club in the world. */
  offerToClub: (club: Club) => { opened: boolean; message: string };
  /** Agent asks the current club for a promotion to the next category. */
  requestPromotion: () => { granted: boolean; message: string };
  acceptPromotion: () => void;
  declinePromotion: () => void;
  dismissAgent: () => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
  /** Every save slot stored on this device. */
  saves: CareerSummary[];
  loadSave: (id: string) => boolean;
  deleteSave: (id: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [career, setCareer] = useState<Career | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [lastReport, setLastReport] = useState<SimulationReport | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [saves, setSaves] = useState<CareerSummary[]>([]);

  useEffect(() => {
    setCareer(loadCareer());
    setSettings(loadSettings());
    setSaves(listSaves());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Career | null) => {
    setCareer(next);
    if (next) {
      saveCareer(next);
      setSaves(listSaves());
    }
  }, []);

  const loadSave = useCallback((id: string) => {
    const loaded = loadCareerById(id);
    if (!loaded) return false;
    setActiveCareer(id);
    setCareer(loaded);
    setLastReport(null);
    return true;
  }, []);

  const deleteSave = useCallback((id: string) => {
    deleteCareerById(id);
    setSaves(listSaves());
    setCareer((prev) => (prev && prev.id === id ? null : prev));
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
      setSaves(listSaves());
      return next;
    });
  }, []);

  const simulate = useCallback((scope: SimulationScope) => {
    setSimulating(true);
    setCareer((prev) => {
      if (!prev) return prev;
      const { career: next, report } = simulateCareer(prev, scope);
      saveCareer(next);
      setSaves(listSaves());
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

  const offerToClub = useCallback(
    (club: Club) => {
      if (!career) return { opened: false, message: "Carreira não carregada." };
      const result = offerCareerToClub(career, club);
      persist(result.career);
      return { opened: result.opened, message: result.message };
    },
    [career, persist],
  );

  const requestPromotion = useCallback(() => {
    if (!career) return { granted: false, message: "Carreira não carregada." };
    const result = requestCareerPromotion(career);
    persist(result.career);
    return { granted: result.granted, message: result.message };
  }, [career, persist]);

  const acceptPromotion = useCallback(
    () => updateCareer((prev) => acceptCareerPromotion(prev)),
    [updateCareer],
  );

  const declinePromotion = useCallback(
    () => updateCareer((prev) => declineCareerPromotion(prev)),
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
    deleteCareer(career?.id);
    setSaves(listSaves());
    setCareer(null);
    setLastReport(null);
  }, [career?.id]);

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
      saves,
      loadSave,
      deleteSave,
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
      offerToClub,
      requestPromotion,
      acceptPromotion,
      declinePromotion,
    }),
    [
      hydrated,
      career,
      settings,
      saves,
      loadSave,
      deleteSave,
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
      offerToClub,
      requestPromotion,
      acceptPromotion,
      declinePromotion,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
