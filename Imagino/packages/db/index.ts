import { PrismaClient } from "@prisma/client";

// covert this to a singleton for nextjs
export const prismaClient = new PrismaClient();