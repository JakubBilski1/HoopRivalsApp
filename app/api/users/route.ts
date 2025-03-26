import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());

export const POST = async (req: NextRequest) => {
  const { token, searchQuery } = await req.json();

  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    const userId = decoded.id;

    // Get friendship records where the current user is the sender.
    const sentInvites = await prisma.friendship.findMany({
      where: { userId },
      select: { friendId: true },
    });

    // Get friendship records where the current user is the recipient.
    const receivedInvites = await prisma.friendship.findMany({
      where: { friendId: userId },
      select: { userId: true },
    });

    // Combine all IDs that represent a friendship relationship with the current user.
    const invitedIds = [
      ...sentInvites.map((invite) => invite.friendId),
      ...receivedInvites.map((invite) => invite.userId),
      userId, // Also exclude yourself.
    ];

    // Find users by nickname (case-insensitive) that are not already in any friendship relationship with the current user.
    const users = await prisma.user.findMany({
      where: {
        nickname: { contains: searchQuery, mode: "insensitive" },
        id: { notIn: invitedIds },
      },
      select: {
        id: true,
        nickname: true,
      },
    });

    return new Response(JSON.stringify(users), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};