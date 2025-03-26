import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());

export const POST = async (req: NextRequest) => {
  const { token, friendId, status } = await req.json();
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    const userId = decoded.id;
    const friendship = await prisma.friendship.updateMany({
      where: {
        userId: friendId,
        friendId: userId,
      },
      data: {
        status,
      },
    });
    return new Response(JSON.stringify(friendship), { status: 200 });
  } catch (err) {
    console.log(err);
  }
};
