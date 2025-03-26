import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

type Token = {
  id: string;
};

// Extended aggregated stats type, now including wins.
interface AggregatedStats {
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
  // For quarter groups only:
  pointsPerNorm?: number;
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
  }
  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const verifyResult = await verifyJWT(token);
    if (verifyResult.status !== 200) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Decode token to get userId
    const decoded = jwt.decode(token) as Token;
    const userId = decoded.id;

    // Fetch all matches where the user participated.
    // Include teams (with teamPlayers) to calculate wins.
    const matches = await prisma.match.findMany({
      where: {
        teams: {
          some: {
            teamPlayers: { some: { playerId: userId } },
          },
        },
      },
      include: {
        teams: {
          include: {
            teamPlayers: true,
          },
        },
        quarterMatch: {
          include: {
            quarters: { include: { stats: true } },
          },
        },
        pointsMatch: {
          include: { stats: true },
        },
      },
    });

    // Overall stats (all matches)
    const overallStats = aggregateMatches(matches, userId);

    // --- Quarter Matches Grouping ---
    const quartersMatches = matches.filter(m => m.matchType === "QUARTERS");
    const quartersStatsByTeamSize: Record<string, Record<string, AggregatedStats>> = {};
    for (const match of quartersMatches) {
      if (!match.quarterMatch || match.quarterMatch.quarters.length === 0) continue;
      const teamSize = match.teamSize.toString();
      const qDuration = match.quarterMatch.quarters[0].duration.toString();
      if (!quartersStatsByTeamSize[teamSize]) {
        quartersStatsByTeamSize[teamSize] = {};
      }
      if (!quartersStatsByTeamSize[teamSize][qDuration]) {
        quartersStatsByTeamSize[teamSize][qDuration] = {} as AggregatedStats;
      }
    }
    for (const teamSize in quartersStatsByTeamSize) {
      for (const durationStr in quartersStatsByTeamSize[teamSize]) {
        const duration = parseInt(durationStr, 10);
        const subset = quartersMatches.filter(m => {
          if (!m.quarterMatch || m.quarterMatch.quarters.length === 0) return false;
          const firstQ = m.quarterMatch.quarters[0];
          return m.teamSize.toString() === teamSize && firstQ.duration === duration;
        });
        const aggregated = aggregateMatches(subset, userId, duration);
        quartersStatsByTeamSize[teamSize][durationStr] = aggregated;
      }
    }

    // --- Points Matches Grouping by Team Size and Max Points ---
    const pointsMatches = matches.filter(m => m.matchType === "POINTS" && m.pointsToWin != null);
    const pointsStatsByTeamSizeAndMax: Record<string, Record<string, AggregatedStats>> = {};
    for (const match of pointsMatches) {
      const teamSize = match.teamSize.toString();
      const maxPoints = match.pointsToWin!.toString();
      if (!pointsStatsByTeamSizeAndMax[teamSize]) {
        pointsStatsByTeamSizeAndMax[teamSize] = {};
      }
      if (!pointsStatsByTeamSizeAndMax[teamSize][maxPoints]) {
        pointsStatsByTeamSizeAndMax[teamSize][maxPoints] = {} as AggregatedStats;
      }
    }
    for (const teamSize in pointsStatsByTeamSizeAndMax) {
      for (const max in pointsStatsByTeamSizeAndMax[teamSize]) {
        const subset = pointsMatches.filter(
          m => m.teamSize.toString() === teamSize && m.pointsToWin!.toString() === max
        );
        const aggregated = aggregateMatches(subset, userId);
        pointsStatsByTeamSizeAndMax[teamSize][max] = aggregated;
      }
    }

    return NextResponse.json({
      overallStats,
      quartersStatsByTeamSize,
      pointsStatsByTeamSizeAndMax,
    }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Aggregates stats for a given array of matches.
 * If quarterDuration is provided, computes normalized points per game.
 * Also calculates wins based on game totals computed from stats.
 */
function aggregateMatches(matches: any[], userId: string, quarterDuration?: number): AggregatedStats {
  let totalPoints = 0;
  let totalRebounds = 0;
  let totalAssists = 0;
  let totalFreeThrowsMade = 0;
  let totalBlocks = 0;
  let totalWins = 0;

  let totalTwoPointsMade = 0;
  let totalThreePointsMade = 0;
  let totalTwoPointsAttempted = 0;
  let totalThreePointsAttempted = 0;
  let totalFreeThrowsAttempted = 0;

  let totalGames = 0;
  let totalMinutes = 0;

  for (const match of matches) {
    let userHadStats = false;

    // --- Calculate team totals for win determination ---
    if (match.teams && match.teams.length > 0) {
      // Find the team that the user is on
      const userTeam = match.teams.find((team: any) =>
        team.teamPlayers.some((tp: any) => tp.playerId === userId)
      );
      if (userTeam) {
        // Compute points for each team
        const teamPoints: Record<string, number> = {};
        for (const team of match.teams) {
          let points = 0;
          if (match.matchType === "QUARTERS" && match.quarterMatch) {
            for (const quarter of match.quarterMatch.quarters) {
              for (const stat of quarter.stats) {
                if (team.teamPlayers.some((tp: any) => tp.playerId === stat.playerId)) {
                  points += stat.twoPointsScored * 2 + stat.threePointsScored * 3 + stat.freeThrowsScored;
                }
              }
            }
          } else if (match.matchType === "POINTS" && match.pointsMatch) {
            for (const stat of match.pointsMatch.stats) {
              if (team.teamPlayers.some((tp: any) => tp.playerId === stat.playerId)) {
                points += stat.twoPointsScored * 2 + stat.threePointsScored * 3 + stat.freeThrowsScored;
              }
            }
          }
          teamPoints[team.id] = points;
        }
        // Determine user's team points and maximum opponent points.
        const userTeamPoints = teamPoints[userTeam.id] || 0;
        const opponentPoints = Object.values(teamPoints)
          .filter(points => points !== userTeamPoints);
        const maxOpponentPoints = opponentPoints.length > 0 ? Math.max(...opponentPoints) : 0;
        if (userTeamPoints > maxOpponentPoints) {
          totalWins += 1;
        }
      }
    }

    // --- Aggregate personal stats for the user ---
    if (match.quarterMatch) {
      for (const quarter of match.quarterMatch.quarters) {
        for (const stat of quarter.stats) {
          if (stat.playerId === userId) {
            userHadStats = true;
            totalPoints += stat.twoPointsScored * 2 + stat.threePointsScored * 3 + stat.freeThrowsScored;
            totalRebounds += stat.rebounds ?? 0;
            totalAssists += stat.assists ?? 0;
            totalFreeThrowsMade += stat.freeThrowsScored;
            totalBlocks += stat.blocks ?? 0;
            totalTwoPointsMade += stat.twoPointsScored;
            totalThreePointsMade += stat.threePointsScored;
            totalTwoPointsAttempted += stat.twoPointsAttempted;
            totalThreePointsAttempted += stat.threePointsAttempted;
            totalFreeThrowsAttempted += stat.freeThrowsAttempted;
          }
        }
        if (quarterDuration !== undefined) {
          totalMinutes += quarterDuration;
        } else {
          totalMinutes += quarter.duration;
        }
      }
    }
    if (match.pointsMatch) {
      for (const stat of match.pointsMatch.stats) {
        if (stat.playerId === userId) {
          userHadStats = true;
          totalPoints += stat.twoPointsScored * 2 + stat.threePointsScored * 3 + stat.freeThrowsScored;
          totalRebounds += stat.rebounds ?? 0;
          totalAssists += stat.assists ?? 0;
          totalFreeThrowsMade += stat.freeThrowsScored;
          totalBlocks += stat.blocks ?? 0;
          totalTwoPointsMade += stat.twoPointsScored;
          totalThreePointsMade += stat.threePointsScored;
          totalTwoPointsAttempted += stat.twoPointsAttempted;
          totalThreePointsAttempted += stat.threePointsAttempted;
          totalFreeThrowsAttempted += stat.freeThrowsAttempted;
        }
      }
      totalMinutes += 48;
    }
    if (userHadStats) {
      totalGames += 1;
    }
  }

  const ppg = totalGames > 0 ? totalPoints / totalGames : 0;
  const rpg = totalGames > 0 ? totalRebounds / totalGames : 0;
  const apg = totalGames > 0 ? totalAssists / totalGames : 0;
  const ftpg = totalGames > 0 ? totalFreeThrowsMade / totalGames : 0;
  const bpg = totalGames > 0 ? totalBlocks / totalGames : 0;

  const totalFieldGoalsMade = totalTwoPointsMade + totalThreePointsMade;
  const totalFieldGoalsAttempted = totalTwoPointsAttempted + totalThreePointsAttempted;
  const fgPercentage = totalFieldGoalsAttempted > 0 ? (totalFieldGoalsMade / totalFieldGoalsAttempted) * 100 : 0;
  const twoPtPercentage = totalTwoPointsAttempted > 0 ? (totalTwoPointsMade / totalTwoPointsAttempted) * 100 : 0;
  const threePtPercentage = totalThreePointsAttempted > 0 ? (totalThreePointsMade / totalThreePointsAttempted) * 100 : 0;
  const ftPercentage = totalFreeThrowsAttempted > 0 ? (totalFreeThrowsMade / totalFreeThrowsAttempted) * 100 : 0;

  const result: AggregatedStats = {
    totalPoints,
    totalRebounds,
    totalAssists,
    totalFreeThrows: totalFreeThrowsMade,
    totalBlocks,
    totalGames,
    totalWins,
    ppg,
    rpg,
    apg,
    ftpg,
    bpg,
    fgPercentage,
    twoPtPercentage,
    threePtPercentage,
    ftPercentage,
  };

  // For quarter groups, compute normalized points per game
  if (quarterDuration !== undefined && totalGames > 0) {
    const expectedMinutes = quarterDuration * 4;
    const normFactor = [5, 10].includes(quarterDuration) ? 40 : 48;
    result.pointsPerNorm = (ppg / expectedMinutes) * normFactor;
  }

  return result;
}
