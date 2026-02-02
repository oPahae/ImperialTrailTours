import pool from '../_lib/connect';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, oldPassword, newPassword } = req.body;

  if (!id || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const [users] = await pool.query(
      'SELECT password FROM Users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = users[0].password;

    const isMatch = await bcrypt.compare(oldPassword, hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const saltRounds = 10;
    const newHashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const [result] = await pool.query(
      'UPDATE Users SET password = ? WHERE id = ?',
      [newHashedPassword, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}