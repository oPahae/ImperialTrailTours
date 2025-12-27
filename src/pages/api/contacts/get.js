import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const [contacts] = await pool.query(`
      SELECT id, nom, email, msg, dateC
      FROM Contacts
      ORDER BY dateC DESC
    `);

    res.status(200).json({ contacts });
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}