// src/lib/prisma.ts

import { PrismaClient } from "@prisma/client";

// Prevent multiple instances in Next.js hot reload
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: ["query"], // optional: logs queries to the terminal
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
