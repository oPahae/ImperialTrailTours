import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verifyAuth(req, res) {
  const token = req.cookies?.authToken;

  if (!token) {
    return null;
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    return { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email };
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}