import type { Club } from "@/game/world";
import { cn } from "@/lib/utils";

/**
 * Procedural club crest: real badges are not shippable, so each club gets a
 * deterministic shield built from its official colours and initials.
 */
export function ClubCrest({
  club,
  size = "md",
  className,
}: {
  club: Club;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = getInitials(club.shortName);
  const dimension = size === "lg" ? 88 : size === "sm" ? 32 : 48;
  const fontSize = size === "lg" ? 30 : size === "sm" ? 12 : 17;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 110"
      role="img"
      aria-label={`Escudo do ${club.shortName}`}
      className={cn("shrink-0 drop-shadow-md", className)}
    >
      <path
        d="M50 2 96 16v42c0 26-19 42-46 50C23 100 4 84 4 58V16Z"
        fill={club.colors.primary}
        stroke={club.colors.detail}
        strokeWidth="4"
      />
      <path
        d="M50 2 96 16v14H4V16Z"
        fill={club.colors.secondary}
        opacity="0.95"
      />
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="700"
        fill={club.colors.detail}
        fontFamily="Barlow, sans-serif"
        letterSpacing="1"
      >
        {initials}
      </text>
    </svg>
  );
}

function getInitials(name: string) {
  const clean = name.replace(/[^\p{L}\p{N}\s-]/gu, "").trim();
  const words = clean.split(/[\s-]+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
