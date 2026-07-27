import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { advanceCareerWeek, createCareer, type NewCareerInput } from "./career";
import {
  DEFAULT_SETTINGS,
  deleteCareer,
  loadCareer,
  loadSettings,
  saveCareer,
  saveSettings,
} from "./storage";
import type { Career, GameSettings } from "./types";

interface GameContextValue {
  /** True once localStorage has been read on the client. */
  hydrated: boolean;
  career: Career | null;
  settings: GameSettings;
  startNewCareer: (input: NewCareerInput) => Career;
  updateCareer: (updater: (career: Career) => Career) => void;
  advanceWeek: () => void;
  abandonCareer: () => void;
  updateSettings: (patch: Partial<GameSettings>) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [career, setCareer] = useState<Career | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

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
      persist(next);
      return next;
    },
    [persist],
  );

  const updateCareer = useCallback(
    (updater: (career: Career) => Career) => {
      setCareer((prev) => {
        if (!prev) return prev;
        const next = { ...updater(prev), updatedAt: Date.now() };
        saveCareer(next);
        return next;
      });
    },
    [],
  );

  const advanceWeek = useCallback(() => {
    updateCareer(advanceCareerWeek);
  }, [updateCareer]);

  const abandonCareer = useCallback(() => {
    deleteCareer();
    setCareer(null);
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
      startNewCareer,
      updateCareer,
      advanceWeek,
      abandonCareer,
      updateSettings,
    }),
    [
      hydrated,
      career,
      settings,
      startNewCareer,
      updateCareer,
      advanceWeek,
      abandonCareer,
      updateSettings,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
