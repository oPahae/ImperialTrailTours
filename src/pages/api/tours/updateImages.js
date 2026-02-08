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

    const { id, image, gallery } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'ID du tour requis' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Update main image if provided
        if (image && image.startsWith('data:image')) {
            await conn.query(`
                UPDATE Tours SET img = ? WHERE id = ?
            `, [
                Buffer.from(image.split(',')[1], 'base64'),
                id
            ]);
        }

        // Update gallery if provided
        if (gallery) {
            // Delete existing gallery images
            await conn.query('DELETE FROM Imgs WHERE tourID = ?', [id]);
            
            // Insert new gallery images
            for (const img of gallery) {
                if (!img?.startsWith('data:image')) continue;
                await conn.query(
                    'INSERT INTO Imgs (tourID, contenu) VALUES (?, ?)',
                    [id, Buffer.from(img.split(',')[1], 'base64')]
                );
            }
        }

        await conn.commit();
        res.status(200).json({ success: true, message: 'Images mises à jour' });

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
