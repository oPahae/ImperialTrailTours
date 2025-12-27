import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID de la date manquant' });
  }

  try {
    const [date] = await pool.query(
      'SELECT id, dateDeb AS startDate, dateFin AS endDate, prix AS price, ndispo AS spots FROM Dates WHERE id = ?',
      [id]
    );

    if (date.length === 0) {
      return res.status(404).json({ message: 'Date non trouvée' });
    }

    res.status(200).json({ date: date[0] });

  } catch (error) {
    console.error('Erreur lors de la récupération de la date :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}