import { Link } from "@tanstack/react-router";

import { ClubCrest } from "./ClubCrest";
import { getClub } from "@/game/world";
import type { CompetitionSeason } from "@/game/world";

/** Full league table. Empty editions render zeroed rows, never a blank screen. */
export function StandingsTable({ season }: { season: CompetitionSeason }) {
  return (
    <div className="panel overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground">
            <th className="px-3 py-3 text-left">#</th>
            <th className="px-3 py-3 text-left">Clube</th>
            <th className="px-2 py-3 text-center">P</th>
            <th className="px-2 py-3 text-center">J</th>
            <th className="px-2 py-3 text-center">V</th>
            <th className="px-2 py-3 text-center">E</th>
            <th className="px-2 py-3 text-center">D</th>
            <th className="px-2 py-3 text-center">GP</th>
            <th className="px-2 py-3 text-center">GC</th>
            <th className="px-2 py-3 text-center">SG</th>
          </tr>
        </thead>
        <tbody>
          {season.standings.map((row) => {
            const club = getClub(row.clubId);
            if (!club) return null;
            return (
              <tr
                key={row.clubId}
                className="border-b border-border/50 transition-colors last:border-0 hover:bg-secondary/40"
              >
                <td className="px-3 py-2 text-muted-foreground">{row.position}</td>
                <td className="px-3 py-2">
                  <Link
                    to="/mundo/clube/$clubSlug"
                    params={{ clubSlug: club.slug }}
                    className="flex items-center gap-2 font-medium hover:text-primary"
                  >
                    <ClubCrest club={club} size="sm" />
                    <span className="truncate">{club.shortName}</span>
                  </Link>
                </td>
                <td className="px-2 py-2 text-center font-semibold text-primary">
                  {row.points}
                </td>
                <td className="px-2 py-2 text-center">{row.played}</td>
                <td className="px-2 py-2 text-center">{row.wins}</td>
                <td className="px-2 py-2 text-center">{row.draws}</td>
                <td className="px-2 py-2 text-center">{row.losses}</td>
                <td className="px-2 py-2 text-center">{row.goalsFor}</td>
                <td className="px-2 py-2 text-center">{row.goalsAgainst}</td>
                <td className="px-2 py-2 text-center">{row.goalDifference}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
