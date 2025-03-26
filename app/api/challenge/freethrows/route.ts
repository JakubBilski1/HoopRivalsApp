import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());

const getBadgeId = (madeShots: number, attempts: number) => {
  const efficiency =
    attempts === 0 ? 0 : Math.round((madeShots / attempts) * 100);
  if (efficiency <= 40) {
    return 1;
  } else if (efficiency <= 70 && efficiency > 40) {
    return 2;
  } else if (efficiency > 70 && efficiency <= 90) {
    return 3;
  } else if (efficiency > 90) {
    return 4;
  }
  return 1;
};

export const POST = async (req: NextRequest) => {
  const { token, date, madeShots, attempts } = await req.json();
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    if (!madeShots || !attempts) {
      return new Response("Invalid data", { status: 400 });
    }
    if (madeShots > attempts) {
      return new Response("You can't make more shots than attempts", {
        status: 400,
      });
    }
    const badge = getBadgeId(madeShots, attempts);
    if (!badge) {
      return new Response("Invalid data", { status: 400 });
    }
    const freethrows = await prisma.challenges.create({
      data: {
        challengeType: "freethrows",
        userId: decoded.id,
        date: date ? new Date(date) : new Date(),
        freeThrows: {
          create: {
            shotsMade: madeShots,
            shotsTaken: attempts,
          },
        },
        challengeBadgeId: badge,
      },
    });
    return new Response(JSON.stringify(freethrows), { status: 200 });
  } catch (err) {
    console.log(err);
    return new Response("Internal Server Error", { status: 500 });
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
    const freethrows = await prisma.challenges.findMany({
      where: {
        userId,
        challengeType: "freethrows",
      },
      include: {
        freeThrows: true,
        challengeBadge: true,
      },
    });
    console.log(freethrows);
    return new Response(JSON.stringify(freethrows), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const DELETE = async (req: NextRequest) => {
  const { token, challengeId } = await req.json();
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    const challenge = await prisma.challenges.delete({
      where: {
        id: challengeId,
      },
    });
    return new Response(JSON.stringify(challenge), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const PUT = async (req: NextRequest) => {
  const { token, challengeId, madeShots, attempts, date } = await req.json();
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    if (!madeShots || !attempts) {
      return new Response("Invalid data", { status: 400 });
    }
    if (madeShots > attempts) {
      return new Response("You can't make more shots than attempts", {
        status: 400,
      });
    }
    const badge = getBadgeId(madeShots, attempts);
    if (!badge) {
      return new Response("Invalid data", { status: 400 });
    }
    const challenge = await prisma.challenges.update({
      where: {
        id: challengeId,
      },
      data: {
        freeThrows: {
          update: {
            shotsMade: madeShots,
            shotsTaken: attempts,
          },
        },
        date: date ? new Date(date) : new Date(), // update challenge's date if needed
        challengeBadgeId: badge,
      },
    });

    return new Response(JSON.stringify(challenge), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
