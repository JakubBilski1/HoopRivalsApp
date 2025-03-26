import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyJWT } from "@/utils/verifyJWT";
import { withAccelerate } from "@prisma/extension-accelerate";
import { imageFileToBase64 } from "@/utils/usables";

const prisma = new PrismaClient().$extends(withAccelerate());

type Props = {
  params: Promise<{
    id: string;
  }>
}

export async function PUT(
  request: NextRequest,
  props: Props
) {
  try {
    const formData = await request.formData();
    const token = formData.get("token")?.toString() || "";
    const name = formData.get("name")?.toString() || "";
    const location = formData.get("location")?.toString() || "";
    const imageFile = formData.get("image");

    const params = await props.params;
    const id = params.id;
    if (!id) {
      return new Response("Missing match ID", { status: 400 });
    }

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
  request: NextRequest,
  props: Props
) {
  // Destructure the id directly from params
  try {
    // Extract token from Authorization header
    const authorizationHeader = request.headers.get("Authorization");

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return new Response("Unauthorized: No token provided", { status: 401 });
    }

    const token = authorizationHeader.split(" ")[1];

    const verify = await verifyJWT(token);
    if (verify.status !== 200) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await props.params;
    const id = params.id;

    if (!id) {
      return new Response("Missing arena ID", { status: 400 });
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
