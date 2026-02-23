const db = require('../db');
const { reply } = require('../utils/helpers');

const execute = async (msg, args, client, text, lines) => {
    const userJid = msg.from;
    const targetStr = args[2];

    if (!targetStr) return reply(msg, "❌ Format salah. Contoh: !h delete 1 atau !h delete all");

    if (targetStr.toLowerCase() === 'all') {
        try {
            await db.deleteHistory(userJid);

            // Karena data histori dihapus, sebaiknya hapus juga dari active_tracks si user
            const activeTracks = await db.getAllActiveTracks();
            for (const track of activeTracks) {
                if (track.user_jid === userJid) {
                    await db.removeActiveTrack(userJid, track.courier, track.awb);
                }
            }

            reply(msg, "✅ Seluruh histori Anda berhasil dihapus dari memori bot.");
        } catch (error) {
            reply(msg, "❌ Gagal menghapus seluruh histori.");
        }
    } else {
        try {
            const histories = await db.getHistory(userJid);
            if (histories.length === 0) return reply(msg, "📭 Histori Anda sudah kosong.");

            const targets = targetStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
            let deleted = 0;

            const displayLimit = 20;
            const displayHistories = histories.slice(-displayLimit);

            for (const t of targets) {
                const idx = t - 1;
                if (displayHistories[idx]) {
                    const h = displayHistories[idx];
                    await db.deleteHistory(userJid, h.id);
                    await db.removeActiveTrack(userJid, h.courier, h.awb);
                    deleted++;
                }
            }

            if (deleted > 0) {
                reply(msg, `✅ Berhasil menghapus ${deleted} resi dari histori.`);
            } else {
                reply(msg, "❌ Nomor histori tidak ditemukan.");
            }

        } catch (error) {
            reply(msg, "❌ Gagal menghapus histori parsial.");
        }
    }
};

module.exports = { execute };
