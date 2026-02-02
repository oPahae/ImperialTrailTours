import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, nom, prenom, email } = req.body;

  if (!id || !nom || !prenom || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [existingUser] = await pool.query(
      'SELECT id FROM Users WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const [result] = await pool.query(
      'UPDATE Users SET nom = ?, prenom = ?, email = ? WHERE id = ?',
      [nom, prenom, email, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}