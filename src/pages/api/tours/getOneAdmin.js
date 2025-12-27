import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID du tour manquant' });
  }

  try {
    const [tour] = await pool.query(
      `SELECT
        t.id,
        t.titre AS title,
        t.descr AS description,
        t.codeUnique AS code,
        t.type,
        t.njours AS days,
        t.img AS image,
        t.places,
        AVG(r.netoiles) AS rating,
        COUNT(r.id) AS reviews
      FROM Tours t
      LEFT JOIN ReviewsTour r ON t.id = r.id
      WHERE t.id = ?
      GROUP BY t.id`,
      [id]
    );

    if (tour.length === 0) {
      return res.status(404).json({ message: 'Tour non trouvé' });
    }

    const [gallery] = await pool.query('SELECT contenu FROM Imgs WHERE tourID = ?', [id]);
    const [program] = await pool.query('SELECT id, titre, descr, inclus, places FROM Jours WHERE tourID = ? ORDER BY id', [id]);
    const [highlights] = await pool.query('SELECT texte FROM Highlights WHERE tourID = ?', [id]);
    const [availableDates] = await pool.query('SELECT id, dateDeb AS startDate, dateFin AS endDate, prix AS price, ndispo AS spots FROM Dates WHERE tourID = ?', [id]);
    const formattedTour = {
      id: tour[0].id,
      code: tour[0].code,
      title: tour[0].title,
      type: tour[0].type,
      days: tour[0].days,
      price: tour[0].price || 0,
      date: tour[0].date || '',
      image: tour[0].image ? `data:image/jpeg;base64,${tour[0].image.toString('base64')}` : '',
      places: tour[0].places ? tour[0].places.split(',') : [],
      rating: tour[0].rating || 0,
      reviews: tour[0].reviews || 0,
      description: tour[0].description,
      gallery: gallery.map(img => `data:image/jpeg;base64,${img.contenu.toString('base64')}`),
      program: program.map(day => ({
        day: day.id,
        title: day.titre,
        description: day.descr,
        places: day.places ? day.places.split(',') : [],
        included: day.inclus ? day.inclus.split(',') : [],
      })),
      highlights: highlights.map(h => h.texte),
      availableDates: availableDates.map(date => ({
        id: date.id,
        startDate: date.startDate.toISOString().split('T')[0],
        endDate: date.endDate.toISOString().split('T')[0],
        price: date.price,
        spots: date.spots
      }))
    };

    res.status(200).json({ tour: formattedTour });
  } catch (error) {
    console.error('Erreur lors de la récupération du tour :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}