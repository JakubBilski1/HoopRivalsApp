// app/(protected)/matches/types.ts

import { Arena, PointsMatch, QuarterMatch, QuarterStat, Team } from "@prisma/client";
import { ShortenedUser } from "./User";

export type MatchType = "QUARTERS" | "POINTS";
export type TeamSizeOption = "1v1" | "2v2" | "3v3" | "4v4" | "5v5";

export interface Player {
  nickname: string;
  avatarUrl?: string;
}

type TeamPlayer = {
  id: number;
  player: ShortenedUser;
  playerId: string;
  teamId: number;
}

type FullTeam = Team & {
  teamPlayers: TeamPlayer[];
}

export interface Match {
  id: number;
  date: string; // e.g. "2025-03-15"
  matchType: MatchType;
  teamSize: number;
  pointsToWin: number | null;
  arenaId: number;
  arena: Arena;
  teams: FullTeam[];
  pointsMatch?: PointsMatch & { stats: QuarterStat[] };
  quarterMatch?: QuarterMatch & { quarters: StatQuarter[] };
}

export type StatQuarter = Quarter & {
  id: number;
  stats: QuarterStat[];
}

export type Quarter = {
    duration: number;
    number: number;
}

export type MatchParams = {
    matchType: MatchType;
    pointsToWin?: number | null;
    date: string;
    quarters?: Quarter[];
    teamA: ShortenedUser[];
    teamB: ShortenedUser[];
    arenaId: number;
    teamSize: number;
}

export interface FullStatsData {
  totalPoints: number;
  totalRebounds: number;
  totalAssists: number;
  totalFreeThrows: number;
  totalBlocks: number;
  totalGames: number;
  totalWins: number;
  ppg: number;
  rpg: number;
  apg: number;
  ftpg: number;
  bpg: number;
  fgPercentage: number;
  twoPtPercentage: number;
  threePtPercentage: number;
  ftPercentage: number;
}