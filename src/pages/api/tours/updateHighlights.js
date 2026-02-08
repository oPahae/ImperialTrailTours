import pool from '../_lib/connect';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { id, highlights } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID du tour requis' });
    }

    if (!Array.isArray(highlights)) {
        return res.status(400).json({ message: 'Highlights doit être un tableau' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Delete existing highlights
        await conn.query('DELETE FROM Highlights WHERE tourID = ?', [id]);

        // Insert new highlights
        for (const h of highlights) {
            if (!h) continue;
            await conn.query(
                'INSERT INTO Highlights (tourID, titre, texte) VALUES (?, ?, ?)',
                [id, h.substring(0, 50), h]
            );
        }

        await conn.commit();
        res.status(200).json({ success: true, message: 'Highlights mis à jour' });

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
