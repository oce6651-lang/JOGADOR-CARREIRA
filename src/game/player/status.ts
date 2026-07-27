import type { PlayerStatusFlag, PlayerStatusId } from "../types";

export const STATUS_LABELS: Record<
  PlayerStatusId,
  { label: string; tone: "neutral" | "positive" | "warning" | "danger" }
> = {
  unsigned: { label: "Sem clube", tone: "neutral" },
  contracted: { label: "Contratado", tone: "positive" },
  onLoan: { label: "Emprestado", tone: "warning" },
  injured: { label: "Lesionado", tone: "danger" },
  suspended: { label: "Suspenso", tone: "danger" },
  calledUp: { label: "Convocado", tone: "positive" },
  retired: { label: "Aposentado", tone: "neutral" },
};

export function statusLabel(id: PlayerStatusId) {
  return STATUS_LABELS[id]?.label ?? id;
}

export function hasStatus(statuses: PlayerStatusFlag[], id: PlayerStatusId) {
  return statuses.some((status) => status.id === id);
}

export function addStatus(
  statuses: PlayerStatusFlag[],
  flag: PlayerStatusFlag,
): PlayerStatusFlag[] {
  return [...statuses.filter((status) => status.id !== flag.id), flag];
}

export function removeStatus(
  statuses: PlayerStatusFlag[],
  id: PlayerStatusId,
): PlayerStatusFlag[] {
  return statuses.filter((status) => status.id !== id);
}

/** The status that should be displayed as the primary one. */
export function primaryStatus(statuses: PlayerStatusFlag[]): PlayerStatusId {
  const priority: PlayerStatusId[] = [
    "retired",
    "injured",
    "suspended",
    "onLoan",
    "calledUp",
    "contracted",
    "unsigned",
  ];
  return priority.find((id) => hasStatus(statuses, id)) ?? "unsigned";
}
