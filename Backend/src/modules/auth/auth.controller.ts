import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service";
import { signToken } from "../../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUser(name, email, password);

    const token = signToken({ id: user.id, email: user.email });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name, // ✅ ADDED
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await loginUser(email, password);
    const token = signToken({ id: user.id, email: user.email });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name, // ✅ ADDED
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
};
