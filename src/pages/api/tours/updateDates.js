import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { id, availableDates } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID du tour requis' });
    }

    if (!Array.isArray(availableDates)) {
        return res.status(400).json({ message: 'AvailableDates doit être un tableau' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Delete existing dates
        await conn.query('DELETE FROM Dates WHERE tourID = ?', [id]);

        // Insert new dates
        for (const d of availableDates) {
            await conn.query(
                'INSERT INTO Dates (tourID, dateDeb, dateFin, prix, ndispo) VALUES (?, ?, ?, ?, ?)',
                [id, d.startDate, d.endDate, d.price, d.spots]
            );
        }

        await conn.commit();
        res.status(200).json({ success: true, message: 'Dates disponibles mises à jour' });

    } catch (error) {
        if (conn) {
            try {
                await conn.rollback();
            } catch (_) {
                console.error('Rollback impossible (connexion déjà fermée)');
            }
        }
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });

    } finally {
        if (conn) conn.release();
    }
}
