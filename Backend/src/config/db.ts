import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [ "warn", "error"], // helpful for development
});

export default prisma;
