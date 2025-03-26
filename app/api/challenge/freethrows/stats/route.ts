import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());

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
    const freethrows = await prisma.challenges.findMany({
      where: {
        userId,
        challengeType: "freethrows",
      },
      include: {
        freeThrows: true,
      },
    });
    const worstBadges = freethrows.filter(
      (challenge) => challenge.challengeBadgeId === 1
    ).length;
    const thirdPlace = freethrows.filter(
      (challenge) => challenge.challengeBadgeId === 2
    ).length;
    const secondPlace = freethrows.filter(
      (challenge) => challenge.challengeBadgeId === 3
    ).length;
    const firstPlace = freethrows.filter(
      (challenge) => challenge.challengeBadgeId === 4
    ).length;
    const allTimeEfficiency =
      freethrows.reduce((acc, challenge) => {
        return (
          acc +
          (challenge.freeThrows
            ? challenge.freeThrows.shotsMade / challenge.freeThrows.shotsTaken
            : 0)
        );
      }, 0) / freethrows.length;
    const allTimeShotsMade = freethrows.reduce((acc, challenge) => {
      return acc + (challenge.freeThrows ? challenge.freeThrows.shotsMade : 0);
    }, 0);
    const allTimeShotsTaken = freethrows.reduce((acc, challenge) => {
      return acc + (challenge.freeThrows ? challenge.freeThrows.shotsTaken : 0);
    }, 0);
    const allTimeTotalChallenges = freethrows.length;
    const stats = {
        worstBadges,
        thirdPlace,
        secondPlace,
        firstPlace,
        allTimeEfficiency,
        allTimeShotsMade,
        allTimeShotsTaken,
        allTimeTotalChallenges,
    }
    return new Response(JSON.stringify(stats), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
