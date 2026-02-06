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

    // Query pour les tours non-daily
    let nonDailyQuery = `
      SELECT
        t.id,
        t.titre AS title,
        t.descr AS description,
        t.codeUnique AS code,
        t.type,
        t.njours AS days,
        t.img AS image,
        t.places,
        t.daily,
        NULL AS dateStart,
        NULL AS tourPrice,
        GROUP_CONCAT(DISTINCT h.titre SEPARATOR ', ') AS highlights,
        MIN(d.prix) AS price,
        MIN(d.dateDeb) AS date,
        MAX(d.dateDeb) AS dateMax,
        AVG(rt.netoiles) AS rating,
        COUNT(rt.id) AS reviews
      FROM Tours t
      LEFT JOIN Dates d ON t.id = d.tourID
      LEFT JOIN ReviewsTour rt ON t.id = rt.tourID
      LEFT JOIN Highlights h ON t.id = h.tourID
      WHERE t.daily = FALSE
    `;

    // Query pour les tours daily
    let dailyQuery = `
      SELECT
        t.id,
        t.titre AS title,
        t.descr AS description,
        t.codeUnique AS code,
        t.type,
        t.njours AS days,
        t.img AS image,
        t.places,
        t.daily,
        t.dateStart,
        t.price AS tourPrice,
        GROUP_CONCAT(DISTINCT h.titre SEPARATOR ', ') AS highlights,
        t.price AS price,
        t.dateStart AS date,
        NULL AS dateMax,
        AVG(rt.netoiles) AS rating,
        COUNT(rt.id) AS reviews
      FROM Tours t
      LEFT JOIN ReviewsTour rt ON t.id = rt.tourID
      LEFT JOIN Highlights h ON t.id = h.tourID
      WHERE t.daily = TRUE
    `;

    const params = [];
    const dailyParams = [];

    // Filtres pour les tours non-daily
    if (searchTerm) {
      nonDailyQuery += ` AND (t.titre LIKE ? OR t.places LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (type) {
      nonDailyQuery += ` AND t.type = ?`;
      params.push(type);
    }

    if (dateFrom) {
      nonDailyQuery += ` AND d.dateDeb >= ?`;
      params.push(dateFrom);
    }
    if (dateTo) {
      nonDailyQuery += ` AND d.dateFin <= ?`;
      params.push(dateTo);
    }

    nonDailyQuery += ` AND t.njours BETWEEN ? AND ?`;
    params.push(parseInt(daysMin), parseInt(daysMax));

    nonDailyQuery += ` AND d.prix BETWEEN ? AND ?`;
    params.push(parseFloat(budgetMin), parseFloat(budgetMax));

    nonDailyQuery += ` GROUP BY t.id `;

    // Filtres pour les tours daily
    if (searchTerm) {
      dailyQuery += ` AND (t.titre LIKE ? OR t.places LIKE ?)`;
      dailyParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (type) {
      dailyQuery += ` AND t.type = ?`;
      dailyParams.push(type);
    }

    if (dateFrom) {
      dailyQuery += ` AND t.dateStart >= ?`;
      dailyParams.push(dateFrom);
    }

    dailyQuery += ` AND t.njours BETWEEN ? AND ?`;
    dailyParams.push(parseInt(daysMin), parseInt(daysMax));

    dailyQuery += ` AND t.price BETWEEN ? AND ?`;
    dailyParams.push(parseFloat(budgetMin), parseFloat(budgetMax));

    dailyQuery += ` GROUP BY t.id `;

    // Combiner les deux queries avec UNION
    let combinedQuery = `(${nonDailyQuery}) UNION ALL (${dailyQuery})`;
    const combinedParams = [...params, ...dailyParams];

    // Tri global
    switch (sortBy) {
      case 'price-asc':
        combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined ORDER BY price ASC`;
        break;
      case 'price-desc':
        combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined ORDER BY price DESC`;
        break;
      case 'days-asc':
        combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined ORDER BY days ASC`;
        break;
      case 'days-desc':
        combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined ORDER BY days DESC`;
        break;
      case 'rating':
        combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined ORDER BY rating DESC`;
        break;
      case 'date':
        combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined ORDER BY date ASC`;
        break;
      default:
        combinedQuery = `SELECT * FROM (${combinedQuery}) AS combined ORDER BY id DESC`;
        break;
    }

    combinedQuery += ` LIMIT ? OFFSET ?`;
    combinedParams.push(parseInt(limit), parseInt(offset));

    const [tours] = await pool.query(combinedQuery, combinedParams);

    // Compter le total
    let countQuery = `
      SELECT COUNT(*) AS total FROM (
        SELECT t.id FROM Tours t
        LEFT JOIN Dates d ON t.id = d.tourID
        WHERE t.daily = FALSE
        ${searchTerm ? 'AND (t.titre LIKE ? OR t.places LIKE ?)' : ''}
        ${type ? 'AND t.type = ?' : ''}
        GROUP BY t.id
        UNION ALL
        SELECT t.id FROM Tours t
        WHERE t.daily = TRUE
        ${searchTerm ? 'AND (t.titre LIKE ? OR t.places LIKE ?)' : ''}
        ${type ? 'AND t.type = ?' : ''}
        GROUP BY t.id
      ) AS total_tours
    `;

    let countParams = [];
    if (searchTerm && type) {
      countParams = [`%${searchTerm}%`, `%${searchTerm}%`, type, `%${searchTerm}%`, `%${searchTerm}%`, type];
    } else if (searchTerm) {
      countParams = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    } else if (type) {
      countParams = [type, type];
    }

    const [total] = await pool.query(countQuery, countParams);
    console.log(tours[0])

    const formattedTours = tours.map(tour => ({
      id: tour.id,
      code: tour.code,
      title: tour.title,
      type: tour.type,
      days: tour.days,
      price: tour.price || 0,
      daily: tour.daily,
      date: formatDate(tour.date),
      dateMax: formatDate(tour.dateMax),
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

const formatDate = (value) => {
  if (!value) return null;

  const d = new Date(value);
  if (isNaN(d.getTime())) return null;

  return d.toISOString().split('T')[0];
};