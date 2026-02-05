import pool from '../_lib/connect';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const {
      title,
      description,
      type,
      days,
      mainImage,
      gallery,
      places,
      program,
      highlights,
      availableDates,
    } = req.body;

    if (!title || !description || !type || !days || !mainImage || !gallery || !places || !program || !highlights || !availableDates) {
      res.status(400).json({ message: 'All fields must be filled' });
    }

    const [tourResult] = await pool.query(
      'INSERT INTO Tours (titre, descr, codeUnique, njours, img, places, type) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        title,
        description,
        places.length > 1 ?
          `TOUR${parseInt(Math.random(0, 1) * 100)}-${new Date(Date.now()).toLocaleDateString('FR-fr').replaceAll("/", "")}-${places[0].toUpperCase().slice(0, 3)}-${places[1].toUpperCase().slice(0, 3)}-${places[places.length - 1].toUpperCase().slice(0, 3)}`
          :
          `TOUR${parseInt(Math.random(0, 1) * 100)}-${new Date(Date.now()).toLocaleDateString('FR-fr').replaceAll("/", "")}-${places[0].toUpperCase().slice(0, 3).slice(0, 3)}`,
        days,
        mainImage ? Buffer.from(mainImage, 'base64') : null,
        places.join(','),
        type,
      ]
    );

    const tourId = tourResult.insertId;

    if (gallery && gallery.length > 0) {
      for (const img of gallery) {
        await pool.query(
          'INSERT INTO Imgs (tourID, contenu) VALUES (?, ?)',
          [tourId, Buffer.from(img.data, 'base64')]
        );
      }
    }

    for (const day of program) {
      await pool.query(
        'INSERT INTO Jours (tourID, titre, descr, inclus, places) VALUES (?, ?, ?, ?, ?)',
        [
          tourId,
          day.title,
          day.description,
          day.included.join(','),
          day.places.join(','),
        ]
      );
    }

    for (const date of availableDates) {
      await pool.query(
        'INSERT INTO Dates (tourID, dateDeb, dateFin, ndispo, prix) VALUES (?, ?, ?, ?, ?)',
        [
          tourId,
          date.startDate,
          date.endDate,
          date.spots,
          date.price,
        ]
      );
    }

    for (const highlight of highlights) {
      await pool.query(
        'INSERT INTO Highlights (tourID, titre, texte) VALUES (?, ?, ?)',
        [
          tourId,
          highlight.substring(0, 50),
          highlight,
        ]
      );
    }

    res.status(201).json({ success: true, tourId });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du tour :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}
