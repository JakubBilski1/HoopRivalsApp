import { NextRequest } from "next/server";
import { PrismaClient, MatchType } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { verifyJWT } from "@/utils/verifyJWT";

const prisma = new PrismaClient().$extends(withAccelerate());

// Helper function to validate player stats
function validatePlayerStats(stats: {
  twoPointsScored: number;
  twoPointsAttempted: number;
  threePointsScored: number;
  threePointsAttempted: number;
  freeThrowsScored: number;
  freeThrowsAttempted: number;
  rebounds?: number;
  assists?: number;
  blocks: number;
}): boolean {
  if (stats.twoPointsScored > stats.twoPointsAttempted) return false;
  if (stats.threePointsScored > stats.threePointsAttempted) return false;
  if (stats.freeThrowsScored > stats.freeThrowsAttempted) return false;
  return true;
}

// Types for the incoming request body
type TeamStats = {
  playerId: string;
  stats: {
    twoPointsScored: number;
    twoPointsAttempted: number;
    threePointsScored: number;
    threePointsAttempted: number;
    freeThrowsScored: number;
    freeThrowsAttempted: number;
    rebounds?: number;
    assists?: number;
    blocks: number;
  };
};

type QuarterStatsData = {
  quarterId: number;
  stats: {
    teamA: TeamStats[];
    teamB: TeamStats[];
  };
};

type PointsStatsData = {
  stats: {
    teamA: TeamStats[];
    teamB: TeamStats[];
  };
};

type RequestBody = {
  matchId: number;
  // Either an array of quarter data OR a single object for points-based stats:
  statsData: QuarterStatsData[] | PointsStatsData;
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("hoop-rivals-auth-token")?.value;
    if (!token) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }
    const body = (await req.json()) as RequestBody;
    const { matchId, statsData } = body;
    
    // Guard: Ensure matchId is provided
    if (matchId === undefined || matchId === null) {
      return new Response("Missing matchId", { status: 400 });
    }
    
    // 1) Verify the user is authenticated
    const verified = await verifyJWT(token);
    if (verified.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    // 2) Look up the match to check its type
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        matchType: true,
      },
    });
    
    if (!match) {
      return new Response("Match not found", { status: 404 });
    }
    
    // 3) Depending on matchType, validate stats data and create stats records
    if (match.matchType === MatchType.QUARTERS) {
      // We expect statsData to be an array of quarters
      if (!Array.isArray(statsData)) {
        return new Response(
          "Invalid stats data for QUARTERS match. Expected array.",
          { status: 400 }
        );
      }
      
      // Validate each player's stats in every quarter
      for (const quarterObj of statsData) {
        for (const teamKey of ["teamA", "teamB"] as const) {
          for (const player of quarterObj.stats[teamKey]) {
            if (!validatePlayerStats(player.stats)) {
              return new Response(
                "Invalid stats: scored cannot be greater than attempted",
                { status: 400 }
              );
            }
          }
        }
      }
      
      // For each quarter in the array, create QuarterStat records
      for (const quarterObj of statsData) {
        const { quarterId, stats } = quarterObj;
        for (const teamKey of ["teamA", "teamB"] as const) {
          for (const player of stats[teamKey]) {
            await prisma.quarterStat.create({
              data: {
                quarterId: quarterId,
                playerId: player.playerId,
                twoPointsScored: player.stats.twoPointsScored,
                twoPointsAttempted: player.stats.twoPointsAttempted,
                threePointsScored: player.stats.threePointsScored,
                threePointsAttempted: player.stats.threePointsAttempted,
                freeThrowsScored: player.stats.freeThrowsScored,
                freeThrowsAttempted: player.stats.freeThrowsAttempted,
                rebounds: player.stats.rebounds,
                assists: player.stats.assists,
                blocks: player.stats.blocks,
              },
            });
          }
        }
      }
    } else if (match.matchType === MatchType.POINTS) {
      // We expect statsData to be a single object
      if (Array.isArray(statsData)) {
        return new Response(
          "Invalid stats data for POINTS match. Expected single object.",
          { status: 400 }
        );
      }
      
      // Validate each player's stats in the points match data
      for (const teamKey of ["teamA", "teamB"] as const) {
        for (const player of statsData.stats[teamKey]) {
          if (!validatePlayerStats(player.stats)) {
            return new Response(
              "Invalid stats: scored cannot be greater than attempted",
              { status: 400 }
            );
          }
        }
      }
      
      // Look up the PointsMatch record for this match
      const pointsMatch = await prisma.pointsMatch.findUnique({
        where: { matchId: match.id },
        select: { id: true },
      });
      if (!pointsMatch) {
        return new Response("PointsMatch record not found for this match", { status: 400 });
      }
      
      // Create MatchStats records for each player
      for (const teamKey of ["teamA", "teamB"] as const) {
        for (const player of statsData.stats[teamKey]) {
          await prisma.matchStats.create({
            data: {
              pointsMatchId: pointsMatch.id,
              playerId: player.playerId,
              twoPointsScored: player.stats.twoPointsScored,
              twoPointsAttempted: player.stats.twoPointsAttempted,
              threePointsScored: player.stats.threePointsScored,
              threePointsAttempted: player.stats.threePointsAttempted,
              freeThrowsScored: player.stats.freeThrowsScored,
              freeThrowsAttempted: player.stats.freeThrowsAttempted,
              rebounds: player.stats.rebounds,
              assists: player.stats.assists,
              blocks: player.stats.blocks,
            },
          });
        }
      }
    }
    
    return new Response("Stats recorded successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("hoop-rivals-auth-token")?.value;
    if (!token) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }
    const body = (await req.json()) as RequestBody;
    const { matchId, statsData } = body;
    
    // Guard: Ensure matchId is provided
    if (matchId === undefined || matchId === null) {
      return new Response("Missing matchId", { status: 400 });
    }
    
    // 1) Verify the user is authenticated
    const verified = await verifyJWT(token);
    if (verified.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    
    // 2) Look up the match to check its type
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        id: true,
        matchType: true,
      },
    });
    
    if (!match) {
      return new Response("Match not found", { status: 404 });
    }
    
    // 3) Depending on matchType, validate stats data and update stats records
    if (match.matchType === MatchType.QUARTERS) {
      // We expect statsData to be an array of quarters
      if (!Array.isArray(statsData)) {
        return new Response(
          "Invalid stats data for QUARTERS match. Expected array.",
          { status: 400 }
        );
      }
      
      // Validate each player's stats in every quarter
      for (const quarterObj of statsData) {
        for (const teamKey of ["teamA", "teamB"] as const) {
          for (const player of quarterObj.stats[teamKey]) {
            if (!validatePlayerStats(player.stats)) {
              return new Response(
                "Invalid stats: scored cannot be greater than attempted",
                { status: 400 }
              );
            }
          }
        }
      }
      
      // For each quarter in the array, update QuarterStat records
      for (const quarterObj of statsData) {
        const { quarterId, stats } = quarterObj;
        for (const teamKey of ["teamA", "teamB"] as const) {
          for (const player of stats[teamKey]) {
            await prisma.quarterStat.updateMany({
              where: {
                quarterId: quarterId,
                playerId: player.playerId,
              },
              data: {
                twoPointsScored: player.stats.twoPointsScored,
                twoPointsAttempted: player.stats.twoPointsAttempted,
                threePointsScored: player.stats.threePointsScored,
                threePointsAttempted: player.stats.threePointsAttempted,
                freeThrowsScored: player.stats.freeThrowsScored,
                freeThrowsAttempted: player.stats.freeThrowsAttempted,
                rebounds: player.stats.rebounds,
                assists: player.stats.assists,
                blocks: player.stats.blocks,
              },
            });
          }
        }
      }
    } else if (match.matchType === MatchType.POINTS) {
      // We expect statsData to be a single object
      if (Array.isArray(statsData)) {
        return new Response(
          "Invalid stats data for POINTS match. Expected single object.",
          { status: 400 }
        );
      }
      
      // Validate each player's stats in the points match data
      for (const teamKey of ["teamA", "teamB"] as const) {
        for (const player of statsData.stats[teamKey]) {
          if (!validatePlayerStats(player.stats)) {
            return new Response(
              "Invalid stats: scored cannot be greater than attempted",
              { status: 400 }
            );
          }
        }
      }
      
      // Look up the PointsMatch record for this match
      const pointsMatch = await prisma.pointsMatch.findUnique({
        where: { matchId: match.id },
        select: { id: true },
      });
      if (!pointsMatch) {
        return new Response("PointsMatch record not found for this match", { status: 400 });
      }
      
      // Update MatchStats records for each player
      for (const teamKey of ["teamA", "teamB"] as const) {
        for (const player of statsData.stats[teamKey]) {
          await prisma.matchStats.updateMany({
            where: {
              pointsMatchId: pointsMatch.id,
              playerId: player.playerId,
            },
            data: {
              twoPointsScored: player.stats.twoPointsScored,
              twoPointsAttempted: player.stats.twoPointsAttempted,
              threePointsScored: player.stats.threePointsScored,
              threePointsAttempted: player.stats.threePointsAttempted,
              freeThrowsScored: player.stats.freeThrowsScored,
              freeThrowsAttempted: player.stats.freeThrowsAttempted,
              rebounds: player.stats.rebounds,
              assists: player.stats.assists,
              blocks: player.stats.blocks,
            },
          });
        }
      }
    }
    
    return new Response("Stats updated successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Server Error", { status: 500 });
  }
}
