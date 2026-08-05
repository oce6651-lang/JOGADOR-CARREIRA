import type { Club } from "@/game/world";
import { cn } from "@/lib/utils";

/**
 * Procedural club crest: real badges are not shippable, so each club gets a
 * deterministic shield built from its official colours, initials and a stable
 * pattern (stripes, hoops, sash, halves or a solid field) derived from the
 * slug. Two clubs never look the same, and a club always looks the same.
 */

type CrestPattern = "stripes" | "hoops" | "sash" | "halves" | "cross" | "solid";

const PATTERNS: CrestPattern[] = ["stripes", "hoops", "sash", "halves", "cross", "solid"];

function hash(value: string) {
  let total = 0;
  for (let i = 0; i < value.length; i += 1) total = (total * 31 + value.charCodeAt(i)) >>> 0;
  return total;
}

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
  const fontSize = size === "lg" ? 28 : size === "sm" ? 12 : 16;
  const seed = hash(club.slug);
  const pattern = PATTERNS[seed % PATTERNS.length];
  const clipId = `crest-clip-${club.slug}`;

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 110"
      role="img"
      aria-label={`Escudo do ${club.shortName}`}
      className={cn("shrink-0 drop-shadow-md", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M50 2 96 16v42c0 26-19 42-46 50C23 100 4 84 4 58V16Z" />
        </clipPath>
      </defs>

      <path
        d="M50 2 96 16v42c0 26-19 42-46 50C23 100 4 84 4 58V16Z"
        fill={club.colors.primary}
      />

      <g clipPath={`url(#${clipId})`} opacity="0.95">
        <CrestPattern pattern={pattern} colors={club.colors} />
      </g>

      <path
        d="M50 2 96 16v42c0 26-19 42-46 50C23 100 4 84 4 58V16Z"
        fill="none"
        stroke={club.colors.detail}
        strokeWidth="4"
      />

      <ellipse cx="50" cy="66" rx="30" ry="21" fill={club.colors.primary} opacity="0.88" />
      <ellipse
        cx="50"
        cy="66"
        rx="30"
        ry="21"
        fill="none"
        stroke={club.colors.detail}
        strokeWidth="2"
      />
      <text
        x="50"
        y="73"
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="700"
        fill={club.colors.detail}
        fontFamily="Barlow, sans-serif"
        letterSpacing="1"
      >
        {initials}
      </text>
      <circle cx="50" cy="18" r="4" fill={club.colors.detail} opacity="0.9" />
    </svg>
  );
}

function CrestPattern({
  pattern,
  colors,
}: {
  pattern: CrestPattern;
  colors: Club["colors"];
}) {
  const fill = colors.secondary;
  switch (pattern) {
    case "stripes":
      return (
        <>
          {[8, 32, 56, 80].map((x) => (
            <rect key={x} x={x} y="0" width="12" height="110" fill={fill} />
          ))}
        </>
      );
    case "hoops":
      return (
        <>
          {[6, 30, 54, 78].map((y) => (
            <rect key={y} x="0" y={y} width="100" height="12" fill={fill} />
          ))}
        </>
      );
    case "sash":
      return <path d="M-10 78 78-10h26L14 104Z" fill={fill} />;
    case "halves":
      return <rect x="50" y="0" width="50" height="110" fill={fill} />;
    case "cross":
      return (
        <>
          <rect x="42" y="0" width="16" height="110" fill={fill} />
          <rect x="0" y="34" width="100" height="16" fill={fill} />
        </>
      );
    default:
      return <path d="M50 2 96 16v14H4V16Z" fill={fill} />;
  }
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
