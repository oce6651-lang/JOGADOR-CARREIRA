import type { EntityId, EntityKind } from "./types";

/**
 * Unique id factory. Prefixed by entity kind so ids are readable in save files
 * and impossible to mix up across systems.
 */
export function createId(kind: EntityKind): EntityId {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${kind}_${random}`;
}
