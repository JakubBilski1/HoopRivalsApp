import { Token } from "@/types/User";
import { verifyJWT } from "@/utils/verifyJWT";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
const prisma = new PrismaClient().$extends(withAccelerate());

export const POST = async (req: NextRequest) => {
  const { token, friendUserId } = await req.json();
  try {
    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new Response("Unauthorized", { status: 401 });
    }
    const decoded = jwt.decode(token) as Token;
    const friendship = await prisma.friendship.create({
      data: {
        userId: decoded.id,
        friendId: friendUserId,
      },
    });
    return new Response(JSON.stringify(friendship), { status: 200 });
  } catch (err) {
    console.log(err);
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

    // Query both sides of the friendship relationship.
    const userFriends = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        // Friendships where the current user initiated the request.
        friendships: {
          select: {
            friend: {
              select: {
                id: true,
                nickname: true,
              },
            },
            status: true,
          },
        },
        // Friendships where the current user is the recipient.
        friendOf: {
          select: {
            // For received requests, the sender's info is under the "user" field.
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
            status: true,
          },
        },
      },
    });

    if (!userFriends) {
      return new Response(JSON.stringify({ friends: [], requests: [] }), {
        status: 200,
      });
    }

    // Extract sent and received friendship arrays.
    const sentFriendships = userFriends.friendships; // initiated by me (could be pending or accepted)
    const receivedFriendships = userFriends.friendOf; // received by me

    // Separate the sent friendships into pending and accepted.
    const pendingSent = sentFriendships.filter((f) => f.status === "PENDING");
    const acceptedSent = sentFriendships.filter((f) => f.status === "ACCEPTED");

    // For received friendships, separate pending requests (to be returned in "requests")
    // and accepted friendships (to be merged into "friends").
    const pendingReceived = receivedFriendships.filter(
      (f) => f.status === "PENDING"
    );
    const acceptedReceived = receivedFriendships.filter(
      (f) => f.status === "ACCEPTED"
    );

    // Normalize acceptedReceived so that they match the shape of sent friendships.
    // Convert { user: { id, nickname }, status } to { friend: { id, nickname }, status }.
    const normalizedAcceptedReceived = acceptedReceived.map((f) => ({
      friend: f.user,
      status: f.status,
    }));

    // Merge accepted friendships from both sent and received sides.
    // Use a Map keyed by friend id to remove duplicates.
    const friendsMap = new Map<
      string,
      { friend: { id: string; nickname: string }; status: string }
    >();

    // Add accepted friendships initiated by me.
    acceptedSent.forEach((f) => {
      friendsMap.set(f.friend.id, f);
    });

    // Add accepted friendships received by me.
    normalizedAcceptedReceived.forEach((f) => {
      if (!friendsMap.has(f.friend.id)) {
        friendsMap.set(f.friend.id, f);
      }
    });

    // Add pending sent friendships.
    // If the same friend already exists (as accepted), this will override it with the pending record.
    pendingSent.forEach((f) => {
      friendsMap.set(f.friend.id, f);
    });

    // Convert the map into an array and sort it so that pending ones appear at the top.
    const friendsArray = Array.from(friendsMap.values());
    friendsArray.sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1;
      if (a.status !== "PENDING" && b.status === "PENDING") return 1;
      return 0;
    });

    // For "requests", normalize the pending received requests.
    const requests = pendingReceived.map((f) => ({
      friend: f.user,
      status: f.status,
    }));

    return new Response(JSON.stringify({ friends: friendsArray, requests }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
};
