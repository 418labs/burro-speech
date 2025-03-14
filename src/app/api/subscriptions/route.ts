
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Get user's subscription
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  
  return NextResponse.json({
    subscription,
  });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { plan = "free" } = await request.json();
  
  // Check if user already has a subscription
  const existingSubscription = await prisma.subscription.findUnique({
    where: {
      userId: session.user.id,
    },
  });
  
  if (existingSubscription) {
    // Update existing subscription
    const updatedSubscription = await prisma.subscription.update({
      where: {
        id: existingSubscription.id,
      },
      data: {
        plan,
        status: "active",
      },
    });
    
    return NextResponse.json(updatedSubscription);
  }
  
  // Create new subscription
  const newSubscription = await prisma.subscription.create({
    data: {
      userId: session.user.id,
      plan,
      status: "active",
    },
  });
  
  return NextResponse.json(newSubscription);
}