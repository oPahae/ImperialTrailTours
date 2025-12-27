import pool from '../_lib/connect';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_cle_secrete_ici';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { nom, prenom, email, password } = req.body;

  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
  }

  try {
    const [existingUsers] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Un compte avec cet email existe déjà.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      'INSERT INTO Users (nom, prenom, email, password) VALUES (?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, nom, prenom, email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const serialized = serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    res.setHeader('Set-Cookie', serialized);

    return res.status(201).json({ message: 'Compte créé avec succès ! Redirection vers la page de connexion...' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    return res.status(500).json({ message: 'Une erreur est survenue lors de l\'inscription.' });
  }
}