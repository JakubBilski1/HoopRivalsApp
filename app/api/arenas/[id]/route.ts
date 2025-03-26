import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyJWT } from "@/utils/verifyJWT";
import { withAccelerate } from "@prisma/extension-accelerate";
import { imageFileToBase64 } from "@/utils/usables";

const prisma = new PrismaClient().$extends(withAccelerate());

export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // Await the params before destructuring
  const { id } = await Promise.resolve(context.params);
  // Now you can safely use id
  try {
    const formData = await req.formData();
    const token = formData.get("token")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const location = formData.get("location")?.toString() || "";
    const imageFile = formData.get("image");

    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!imageFile) {
      await prisma.arena.update({
        where: { id: parseInt(id) },
        data: { name, location },
      });
      return NextResponse.json(
        { message: "Arena updated successfully", name, location },
        { status: 200 }
      );
    }

    let readyImage = "";
    if (imageFile instanceof File) {
      readyImage = await imageFileToBase64(imageFile);
    }

    await prisma.arena.update({
      where: { id: parseInt(id) },
      data: { name, location, imageUrl: readyImage },
    });

    return NextResponse.json(
      { message: "Arena updated successfully", name, location },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  // Await the params before using them
  const { id } = await Promise.resolve(context.params);
  try {
    // Example: extract token from query params – adjust as needed.
    const authorizationHeader = req.headers.get("Authorization");

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }

    const token = authorizationHeader.split(" ")[1];

    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.arena.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json(
      { message: "Arena deleted successfully", id },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new NextResponse("Error processing request", { status: 500 });
  }
}
