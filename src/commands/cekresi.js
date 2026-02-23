const db = require('../db');
const binderbyte = require('../binderbyte');
const { reply } = require('../utils/helpers');

const execute = async (msg, args, client, text, lines) => {
    const isMultiLine = lines.length > 1;
    let trackRequests = [];
    const userJid = msg.from;

    if (isMultiLine) {
        // Parsing tiap baris mulai dari baris indeks ke-1
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(' ');
            if (parts.length >= 2) {
                const courier = parts[0].toLowerCase();
                const awb = parts[1];
                const hp = parts[2] || '';
                trackRequests.push({ courier, awb, hp });
            }
        }
    } else {
        // Parsing sebaris (!cekresi jne 1234 0812)
        if (args.length < 3) {
            return reply(msg, "❌ Format salah. Contoh: !cekresi jnt 987654321");
        }
        const courier = args[1].toLowerCase();
        const awb = args[2];
        const hp = args[3] || '';
        trackRequests.push({ courier, awb, hp });
    }

    if (trackRequests.length === 0) {
        return reply(msg, "❌ Tidak ada data resi yang valid untuk dicek.");
    }

    await reply(msg, `⏳ Sedang melacak ${trackRequests.length} resi, mohon tunggu...`);

    let results = [];

    // Loop semua request
    for (const req of trackRequests) {
        try {
            const data = await binderbyte.trackReceipt(req.awb, req.courier, req.hp);
            const formattedText = binderbyte.formatTrackingResult(data);
            results.push(formattedText);

            // Tambah ke history
            await db.addHistory(userJid, data.summary.courier, data.summary.awb, req.hp);

            // Jika status belum delivered, masukkan ke active track untuk Cron job
            if (data.summary.status.toLowerCase() !== 'delivered') {
                await db.addActiveTrack(userJid, data.summary.courier, data.summary.awb, req.hp, data.summary.status);
            } else {
                // Jika sudah delivered, hapus dari active tracks kalau sebelumnya ada
                await db.removeActiveTrack(userJid, data.summary.courier, data.summary.awb);
            }

        } catch (error) {
            results.push(`❌ Gagal melacak kurir ${req.courier.toUpperCase()} resi ${req.awb}: ${error.message}`);
        }
    }

    // Balas ke user satu per satu
    for (const res of results) {
        await reply(msg, res);
    }
};

module.exports = { execute };
