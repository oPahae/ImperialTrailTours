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

    /* =========================
       TOURS NON-DAILY
    ========================= */
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
      LEFT JOIN Dates d 
        ON t.id = d.tourID
        AND d.prix BETWEEN ? AND ?
        ${dateFrom ? 'AND d.dateDeb >= ?' : ''}
        ${dateTo ? 'AND d.dateFin <= ?' : ''}
      LEFT JOIN ReviewsTour rt ON t.id = rt.tourID
      LEFT JOIN Highlights h ON t.id = h.tourID
      WHERE t.daily = FALSE
    `;

    const params = [];
    params.push(+budgetMin, +budgetMax);
    if (dateFrom) params.push(dateFrom);
    if (dateTo) params.push(dateTo);

    if (searchTerm) {
      nonDailyQuery += ` AND (t.titre LIKE ? OR t.places LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (type) {
      nonDailyQuery += ` AND t.type = ?`;
      params.push(type);
    }

    nonDailyQuery += ` AND t.njours BETWEEN ? AND ?`;
    params.push(+daysMin, +daysMax);

    nonDailyQuery += ` GROUP BY t.id `;

    /* =========================
       TOURS DAILY
    ========================= */
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

    const dailyParams = [];

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
    dailyParams.push(+daysMin, +daysMax);

    dailyQuery += ` AND t.price BETWEEN ? AND ?`;
    dailyParams.push(+budgetMin, +budgetMax);

    dailyQuery += ` GROUP BY t.id `;

    /* =========================
       UNION + TRI GLOBAL
    ========================= */
    let combinedQuery = `
      SELECT * FROM (
        (${nonDailyQuery})
        UNION ALL
        (${dailyQuery})
      ) AS combined
    `;

    const combinedParams = [...params, ...dailyParams];

    switch (sortBy) {
      case 'price-asc':
        combinedQuery += ` ORDER BY IFNULL(price, 999999) ASC`;
        break;
      case 'price-desc':
        combinedQuery += ` ORDER BY IFNULL(price, 0) DESC`;
        break;
      case 'days-asc':
        combinedQuery += ` ORDER BY days ASC`;
        break;
      case 'days-desc':
        combinedQuery += ` ORDER BY days DESC`;
        break;
      case 'rating':
        combinedQuery += ` ORDER BY rating DESC`;
        break;
      case 'date':
        combinedQuery += ` ORDER BY IFNULL(date, '9999-12-31') ASC`;
        break;
      default:
        combinedQuery += ` ORDER BY id DESC`;
    }

    combinedQuery += ` LIMIT ? OFFSET ?`;
    combinedParams.push(+limit, offset);

    const [tours] = await pool.query(combinedQuery, combinedParams);

    /* =========================
       COUNT TOTAL
    ========================= */
    const countQuery = `
      SELECT COUNT(*) AS total FROM (
        SELECT t.id FROM Tours t
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
      ) x
    `;

    const countParams = [];
    if (searchTerm) {
      countParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
      if (type) countParams.push(type);
      countParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
      if (type) countParams.push(type);
    } else if (type) {
      countParams.push(type, type);
    }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    /* =========================
       FORMAT FINAL
    ========================= */
    const formattedTours = tours.map(tour => ({
      id: tour.id,
      code: tour.code,
      title: tour.title,
      type: tour.type,
      days: tour.days,
      price: tour.price ?? 0,
      daily: !!tour.daily,
      date: formatDate(tour.date),
      dateMax: formatDate(tour.dateMax),
      image: tour.image
        ? `data:image/jpeg;base64,${tour.image.toString('base64')}`
        : 'https://via.placeholder.com/800x600?text=No+Image',
      places: tour.places ? tour.places.split(',') : [],
      rating: tour.rating ?? 0,
      reviews: tour.reviews ?? 0,
    }));

    res.status(200).json({ tours: formattedTours, total });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d)) return null;
  return d.toISOString().split('T')[0];
};