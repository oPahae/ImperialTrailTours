import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "1111";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Missing password" });
  }

  try {
    const isPasswordMatch = password === "uFgW9loKIuJde35Z";

    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Password incorrect!" });
    }

    const token = jwt.sign({ connected: true }, JWT_SECRET, {
      expiresIn: "1d",
    });

    const serialized = serialize("adminAuthToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    res.setHeader("Set-Cookie", serialized);
    return res.status(200).json({ message: "Logged In Successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
}