import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { tourId, name, rating, comment } = req.body;

  if (!tourId || !name || !rating || !comment) {
    return res.status(400).json({ message: 'Données manquantes' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO ReviewsTour (tourID, nom, netoiles, dateR, contenu) VALUES (?, ?, ?, NOW(), ?)',
      [tourId, name, rating, comment]
    );

    const [newReview] = await pool.query(
      'SELECT id, nom, netoiles AS rating, dateR AS date, contenu AS comment FROM ReviewsTour WHERE id = ? AND nom = ? ORDER BY dateR DESC LIMIT 1',
      [tourId, name]
    );

    res.status(201).json({ success: true, review: newReview[0] });

  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'avis :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}