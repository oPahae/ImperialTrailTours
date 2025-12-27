import pool from '../_lib/connect';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const {
      page = 1,
      limit = 9,
      searchTerm = '',
      sortBy = 'price-asc',
      dateFrom = '',
      dateTo = '',
      daysMin = 1,
      daysMax = 10,
      budgetMin = 500,
      budgetMax = 5000,
      type = ''
    } = req.query;

    const offset = (page - 1) * limit;

    let baseQuery = `
      SELECT
        t.id,
        t.titre AS title,
        t.descr AS description,
        t.codeUnique AS code,
        t.type,
        t.njours AS days,
        t.img AS image,
        t.places,
        GROUP_CONCAT(DISTINCT h.titre SEPARATOR ', ') AS highlights,
        MIN(d.prix) AS price,
        MIN(d.dateDeb) AS date,
        AVG(rt.netoiles) AS rating,
        COUNT(rt.id) AS reviews
      FROM Tours t
      LEFT JOIN Dates d ON t.id = d.tourID
      LEFT JOIN ReviewsTour rt ON t.id = rt.tourID
      LEFT JOIN Highlights h ON t.id = h.tourID
      WHERE 1=1
    `;

    const params = [];

    if (searchTerm) {
      baseQuery += ` AND (t.titre LIKE ? OR t.places LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (type) {
      baseQuery += ` AND t.type = ?`;
      params.push(type);
    }

    if (dateFrom) {
      baseQuery += ` AND d.dateDeb >= ?`;
      params.push(dateFrom);
    }
    if (dateTo) {
      baseQuery += ` AND d.dateFin <= ?`;
      params.push(dateTo);
    }

    baseQuery += ` AND t.njours BETWEEN ? AND ?`;
    params.push(parseInt(daysMin), parseInt(daysMax));

    baseQuery += ` AND d.prix BETWEEN ? AND ?`;
    params.push(parseFloat(budgetMin), parseFloat(budgetMax));

    baseQuery += ` GROUP BY t.id `;

    switch (sortBy) {
      case 'price-asc':
        baseQuery += ` ORDER BY price ASC`;
        break;
      case 'price-desc':
        baseQuery += ` ORDER BY price DESC`;
        break;
      case 'days-asc':
        baseQuery += ` ORDER BY days ASC`;
        break;
      case 'days-desc':
        baseQuery += ` ORDER BY days DESC`;
        break;
      case 'rating':
        baseQuery += ` ORDER BY rating DESC`;
        break;
      case 'date':
        baseQuery += ` ORDER BY date ASC`;
        break;
      default:
        baseQuery += ` ORDER BY t.id DESC`;
        break;
    }

    baseQuery += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [tours] = await pool.query(baseQuery, params);

    const [total] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM Tours t
      LEFT JOIN Dates d ON t.id = d.tourID
      WHERE 1=1
      ${searchTerm ? 'AND (t.titre LIKE ? OR t.places LIKE ?)' : ''}
      ${type ? 'AND t.type = ?' : ''}
    `, searchTerm
        ? type
          ? [`%${searchTerm}%`, `%${searchTerm}%`, type]
          : [`%${searchTerm}%`, `%${searchTerm}%`]
        : type
          ? [type]
          : []
    );

    const formattedTours = tours.map(tour => ({
      id: tour.id,
      code: tour.code,
      title: tour.title,
      type: tour.type,
      days: tour.days,
      price: tour.price || 0,
      date: tour.date ? tour.date.toISOString().split('T')[0] : null,
      image: tour.image
        ? `data:image/jpeg;base64,${tour.image.toString('base64')}`
        : 'https://via.placeholder.com/800x600?text=No+Image',
      places: tour.places ? tour.places.split(',') : [],
      rating: tour.rating || 0,
      reviews: tour.reviews || 0,
    }));

    res.status(200).json({
      tours: formattedTours,
      total: total[0].total,
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des tours :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}