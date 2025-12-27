import pool from '../_lib/connect';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: "10mb",
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const tourData = req.body;

    try {
        await pool.query('START TRANSACTION');

        await pool.query(`
            UPDATE Tours SET
            titre = ?,
            descr = ?,
            codeUnique = ?,
            type = ?,
            njours = ?,
            img = ?,
            places = ?
            WHERE id = ?
        `, [
            tourData.title,
            tourData.description,
            tourData.code,
            tourData.type,
            tourData.days,
            tourData.image ? Buffer.from(tourData.image.split(',')[1], 'base64') : null,
            tourData.places.join(','),
            tourData.id
        ]
        );
        
        // galerie
        await pool.query('DELETE FROM Imgs WHERE tourID = ?', [tourData.id]);
        for (const img of tourData.gallery || []) {
            if (!img || typeof img !== 'string' || !img.startsWith('data:image')) continue;
            await pool.query(
                'INSERT INTO Imgs (tourID, contenu) VALUES (?, ?)',
                [tourData.id, Buffer.from(img.split(',')[1], 'base64')]
            );
        }

        // programme
        await pool.query('DELETE FROM Jours WHERE tourID = ?', [tourData.id]);
        for (const day of tourData.program) {
            await pool.query(
                'INSERT INTO Jours (tourID, titre, descr, inclus, places) VALUES (?, ?, ?, ?, ?)',
                [tourData.id, day.title, day.description, day.included.join(','), day.places.join(',')]
            );
        }

        // highlights
        await pool.query('DELETE FROM Highlights WHERE tourID = ?', [tourData.id]);
        for (const highlight of tourData.highlights) {
            await pool.query(
                'INSERT INTO Highlights (tourID, titre, texte) VALUES (?, ?, ?)',
                [tourData.id, highlight.substring(0, 50), highlight]
            );
        }

        // dates
        await pool.query('DELETE FROM Dates WHERE tourID = ?', [tourData.id]);
        for (const date of tourData.availableDates) {
            await pool.query(
                'INSERT INTO Dates (tourID, dateDeb, dateFin, prix, ndispo) VALUES (?, ?, ?, ?, ?)',
                [tourData.id, date.startDate, date.endDate, date.price, date.spots]
            );
        }

        await pool.query('COMMIT');

        res.status(200).json({ success: true, message: 'Tour mis à jour avec succès' });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Erreur lors de la mise à jour du tour :', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}