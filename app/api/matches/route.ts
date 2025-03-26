import { ShortenedUser, Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { MatchParams } from "@/types/Matches";

const prisma = new PrismaClient().$extends(withAccelerate());

type body = MatchParams & { token: string };

export const POST = async (req: NextRequest) => {
  const {
    matchType,
    date,
    quarters,
    teamA,
    teamB,
    arenaId,
    teamSize,
    pointsToWin,
    token,
  } = (await req.json()) as body;

  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!matchType) {
      return new Response("Missing matchType", { status: 400 });
    }
    if (!date) {
      return new Response("Missing date", { status: 400 });
    }
    if (teamA.length !== teamSize || teamB.length !== teamSize) {
      console.log('teamA:', teamA);
      console.log('teamB:', teamB);
      console.log('teamSize:', teamSize);
      return new Response("Invalid team size", { status: 400 });
    }
    if (!arenaId) {
      return new Response("Missing arena", { status: 400 });
    }
    if (!teamSize) {
      return new Response("Missing teamSize", { status: 400 });
    }

    if (matchType === "QUARTERS") {
      if (!quarters) {
        return new Response("Missing quarters", { status: 400 });
      }
      // Create a match with a nested QuarterMatch and its quarters
      const match = await prisma.match.create({
        data: {
          matchType,
          date: new Date(date),
          arenaId,
          teamSize,
          quarterMatch: {
            create: {
              quarters: {
                create: quarters.map(({ duration, number }) => ({
                  duration,
                  number,
                })),
              },
            },
          },
          teams: {
            create: [
              {
                teamPlayers: {
                  create: teamA.map(({ id }) => ({
                    playerId: id,
                  })),
                },
              },
              {
                teamPlayers: {
                  create: teamB.map(({ id }) => ({
                    playerId: id,
                  })),
                },
              },
            ],
          },
        },
      });
      return new Response(JSON.stringify(match), { status: 200 });
    } else if (matchType === "POINTS") {
      if (!pointsToWin) {
        return new Response("Missing pointsToWin", { status: 400 });
      }
      // Create a match with a nested (empty) PointsMatch
      const match = await prisma.match.create({
        data: {
          matchType,
          date: new Date(date),
          arenaId,
          teamSize,
          pointsToWin,
          pointsMatch: {
            create: {},
          },
          teams: {
            create: [
              {
                teamPlayers: {
                  create: teamA.map(({ id }) => ({
                    playerId: id,
                  })),
                },
              },
              {
                teamPlayers: {
                  create: teamB.map(({ id }) => ({
                    playerId: id,
                  })),
                },
              },
            ],
          },
        },
      });
      return new Response(JSON.stringify(match), { status: 200 });
    }
  } catch (err) {
    console.error(err);
    return new Response("Server error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  const authorizationHeader = req.headers.get("Authorization");

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized: No token provided", { status: 401 });
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }

    const decoded = jwt.decode(token) as Token;
    const userId = decoded.id;

    const unSortedMatches = await prisma.match.findMany({
      where: {
        teams: {
          some: {
            teamPlayers: {
              some: {
                playerId: userId,
              },
            },
          },
        },
      },
      include: {
        arena: true,
        teams: {
          include: {
            teamPlayers: {
              include: {
                player: {
                  select: {
                    id: true,
                    nickname: true,
                  },
                },
              },
            },
          },
        },
        // For QUARTERS type, include quarterMatch and its quarters + stats
        quarterMatch: {
          include: {
            quarters: {
              select: {
                id: true,
                duration: true,
                number: true,
                stats: {
                  include: {
                    player: {
                      select: {
                        id: true,
                        nickname: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        // For POINTS type, include pointsMatch and its stats
        pointsMatch: {
          include: {
            stats: {
              include: {
                player: {
                  select: {
                    id: true,
                    nickname: true,
                  },
                },
              },
            },
          },
        },
      }
    });

    const matches = unSortedMatches.sort((a, b) => {
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    return new Response(JSON.stringify(matches), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
