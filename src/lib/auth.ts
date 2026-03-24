import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export type RoleType = Role;

export async function getOrCreateUserFromClerk(clerkId: string, email: string, name: string, role?: RoleType) {
  let user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email: email || `${clerkId}@placeholder.local`,
        name: name || "User",
        role: role ?? "Analyst",
      },
    });
  }
  return user;
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({ where: { clerkId } });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function requireDbUserByClerkId(clerkId: string) {
  const user = await getUserByClerkId(clerkId);
  if (!user) {
    throw new Error("User not found in database.");
  }
  return user;
}
