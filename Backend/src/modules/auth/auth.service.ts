import prisma from "../../config/db";
import { hashPassword, comparePassword } from "../../utils/hash";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isValid = await comparePassword(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return user;
};
