import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient().$extends(withAccelerate());

// Helper to compute freethrow stats from an array of challenges
function computeFreethrowStats(challenges: any[]) {
  if (!challenges || challenges.length === 0) {
    return {
      worstBadges: 0,
      thirdPlace: 0,
      secondPlace: 0,
      firstPlace: 0,
      allTimeEfficiency: 0,
      allTimeShotsMade: 0,
      allTimeShotsTaken: 0,
      allTimeTotalChallenges: 0,
    };
  }

  let worstBadges = 0;
  let thirdPlace = 0;
  let secondPlace = 0;
  let firstPlace = 0;
  let totalShotsMade = 0;
  let totalShotsTaken = 0;

  for (const challenge of challenges) {
    if (challenge.challengeBadgeId === 1) worstBadges++;
    if (challenge.challengeBadgeId === 2) thirdPlace++;
    if (challenge.challengeBadgeId === 3) secondPlace++;
    if (challenge.challengeBadgeId === 4) firstPlace++;

    if (challenge.freeThrows) {
      totalShotsMade += challenge.freeThrows.shotsMade;
      totalShotsTaken += challenge.freeThrows.shotsTaken;
    }
  }

  const totalChallenges = challenges.length;
  const efficiency = totalShotsTaken > 0 ? totalShotsMade / totalShotsTaken : 0;

  return {
    worstBadges,
    thirdPlace,
    secondPlace,
    firstPlace,
    allTimeEfficiency: efficiency,
    allTimeShotsMade: totalShotsMade,
    allTimeShotsTaken: totalShotsTaken,
    allTimeTotalChallenges: totalChallenges,
  };
}

export const GET = async (req: NextRequest) => {
  const token = req.cookies.get("hoop-rivals-auth-token")?.value;
  if (!token) {
    return new Response("Unauthorized: No token provided", { status: 401 });
  }
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    const userId = decoded.id;

    // Run two queries concurrently to fetch both sides of the friendship
    const [initiated, received] = await Promise.all([
      // Friendships where the user initiated the request
      prisma.friendship.findMany({
        where: { userId, status: "ACCEPTED" },
        select: {
          friend: {
            select: { id: true, nickname: true, avatarUrl: true },
          },
        },
      }),
      // Friendships where the user is the recipient
      prisma.friendship.findMany({
        where: { friendId: userId, status: "ACCEPTED" },
        select: {
          user: {
            select: { id: true, nickname: true, avatarUrl: true },
          },
        },
      }),
    ]);

    // Merge the friend lists into a unique map with nickname and avatarUrl
    const friendMap = new Map<
      string,
      { nickname: string; avatarUrl: string }
    >();
    initiated.forEach((f) => {
      friendMap.set(f.friend.id, {
        nickname: f.friend.nickname,
        avatarUrl: f.friend.avatarUrl
          ? f.friend.avatarUrl
          : "/placeholder.webp",
      });
    });
    received.forEach((f) => {
      friendMap.set(f.user.id, {
        nickname: f.user.nickname,
        avatarUrl: f.user.avatarUrl ? f.user.avatarUrl : "/placeholder.webp",
      });
    });
    const friendIds = Array.from(friendMap.keys());
    if (friendIds.length === 0) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // Fetch all "freethrows" challenges for all friendIds concurrently
    const allChallenges = await prisma.challenges.findMany({
      where: {
        userId: { in: friendIds },
        challengeType: "freethrows",
      },
      select: {
        userId: true,
        challengeBadgeId: true,
        freeThrows: {
          select: {
            shotsMade: true,
            shotsTaken: true,
          },
        },
      },
    });

    // Group challenges by friend id
    const challengesByUser: Record<string, any[]> = {};
    for (const challenge of allChallenges) {
      const uid = challenge.userId;
      if (!challengesByUser[uid]) {
        challengesByUser[uid] = [];
      }
      challengesByUser[uid].push(challenge);
    }

    // Compute stats for each friend and include avatarUrl
    const friendsWithStats = friendIds.map((id) => {
      const friendChallenges = challengesByUser[id] || [];
      const stats = computeFreethrowStats(friendChallenges);
      return {
        id,
        ...friendMap.get(id),
        stats: {
          worstBadges: stats.worstBadges,
          thirdPlace: stats.thirdPlace,
          secondPlace: stats.secondPlace,
          firstPlace: stats.firstPlace,
          allTimeEfficiency: stats.allTimeEfficiency,
          allTimeShotsMade: stats.allTimeShotsMade,
          allTimeShotsTaken: stats.allTimeShotsTaken,
          allTimeTotalChallenges: stats.allTimeTotalChallenges,
        },
      };
    });

    console.log(friendsWithStats);

    return new Response(JSON.stringify(friendsWithStats), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
