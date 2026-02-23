const cron = require('node-cron');
const db = require('./db');
const binderbyte = require('./binderbyte');

const start = (client) => {
    console.log('🔄 Scheduler otomatis 1 jam dimulai (Cron: 0 * * * *)');

    let isRunning = false;

    // Menjalankan setiap jam di menit 00 (misalnya: 10:00, 11:00, dst)
    // Untuk keperluan testing cepat, user bisa ubah ke * * * * * untuk tiap menit
    cron.schedule('0 * * * *', async () => {
        if (isRunning) {
            console.log('[CRON] Dilewati: Proses pengecekan sebelumnya masih berjalan.');
            return;
        }

        console.log('[CRON] Menjalankan automasi pengecekan resi aktif...');
        isRunning = true;

        try {
            const activeTracks = await db.getAllActiveTracks();
            if (activeTracks.length === 0) {
                console.log('[CRON] Tidak ada resi aktif untuk dicek.');
                return;
            }

            console.log(`[CRON] Menemukan ${activeTracks.length} resi aktif.`);

            for (const track of activeTracks) {
                try {
                    // Beri jeda 2 detik antar request agar API BinderByte tidak terkena rate limit
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    const data = await binderbyte.trackReceipt(track.awb, track.courier, track.hp);
                    const currentStatus = data.summary.status;

                    // Periksa apakah status berubah
                    if (currentStatus !== track.last_status) {
                        console.log(`[CRON] Terjadi perubahan status pada ${track.awb} (${track.courier}): ${track.last_status} -> ${currentStatus}`);

                        // Kirim pesan ke user (JID) menggunakan client WhatsApp
                        const formattedText = binderbyte.formatTrackingResult(data);
                        const alertMsg = `📢 *INFO UPDATE RESI OTOMATIS*\n\nTerjadi perubahan status pada paket Anda:\n\n${formattedText}`;

                        await client.sendMessage(track.user_jid, alertMsg);

                        // Update database
                        if (currentStatus.toLowerCase() === 'delivered') {
                            // Selesai, hapus dari list cron
                            await db.removeActiveTrack(track.user_jid, track.courier, track.awb);
                            console.log(`[CRON] Resi ${track.awb} delivered, dihapus dari active tracks.`);
                        } else {
                            // Masih on process, update last status
                            await db.updateActiveTrackStatus(track.user_jid, track.courier, track.awb, currentStatus);
                        }
                    } else {
                        console.log(`[CRON] Tidak ada update resi ${track.awb} (${track.courier}). Status: ${currentStatus}`);
                    }

                } catch (apiError) {
                    console.error(`[CRON] Gagal mengecek resi ${track.awb}: `, apiError.message);
                }
            }

        } catch (err) {
            console.error('[CRON] Terjadi kesalahan saat menarik data database:', err);
        } finally {
            isRunning = false;
        }
    });
};

module.exports = { start };
