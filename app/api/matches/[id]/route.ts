import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyJWT } from "@/utils/verifyJWT";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Token } from "@/types/User";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient().$extends(withAccelerate());

export const DELETE = async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  const { token } = await req.json();
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    const userId = decoded.id;

    const { id } = await Promise.resolve(context.params);
    if (!id) {
      return new Response("Missing match ID", { status: 400 });
    }

    const match = await prisma.match.findFirst({
      where: {
        id: Number(id),
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
    });

    if (!match) {
      return new Response("Match not found", { status: 404 });
    }

    await prisma.match.delete({
      where: {
        id: Number(id),
      },
    });

    return new Response("Match deleted successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export const PUT = async (
  req: NextRequest,
  context: { params: { id: string } }
) => {
  const { date, arenaId, token } = await req.json();
  // Await the params object first:
  const { id } = await Promise.resolve(context.params);
  if (!id) {
    return new Response("Missing match ID", { status: 400 });
  }

  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    if (!date) {
      return new Response("Missing date", { status: 400 });
    }
    if (!arenaId) {
      return new Response("Missing arena", { status: 400 });
    }
    await prisma.match.update({
      where: { id: parseInt(id) },
      data: { date: new Date(date), arenaId },
    });
    return new Response("Match updated successfully", { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
