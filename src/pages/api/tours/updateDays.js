import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { id, program } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID du tour requis' });
    }

    if (!Array.isArray(program)) {
        return res.status(400).json({ message: 'Program doit être un tableau' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Delete existing program days
        await conn.query('DELETE FROM Jours WHERE tourID = ?', [id]);

        // Insert new program days
        for (const day of program) {
            await conn.query(
                'INSERT INTO Jours (tourID, titre, descr, inclus, places) VALUES (?, ?, ?, ?, ?)',
                [
                    id,
                    day.title,
                    day.description,
                    (day.included || []).join(','),
                    (day.places || []).join(',')
                ]
            );
        }

        await conn.commit();
        res.status(200).json({ success: true, message: 'Programme journalier mis à jour' });

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
