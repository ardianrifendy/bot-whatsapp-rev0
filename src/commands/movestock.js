const db = require('../db');
const { reply } = require('../utils/helpers');

const execute = async (msg, args) => {
    // !move Rina 2 (bisa lebih dari 1: !move Rina 2,3)
    if (args.length < 3) return reply(msg, "❌ Format salah. Contoh: !move Rina 1 atau !move Rina 1,2");

    const userName = args[1];
    const targetStr = args[2];

    try {
        const user = await db.getUserByName(userName);
        if (!user) return reply(msg, `❌ User *${userName}* tidak ditemukan.`);

        const userStocks = await db.getStocksByUser(user.id);
        if (userStocks.length === 0) return reply(msg, `📭 User *${user.name}* tidak memiliki barang.`);

        const targets = targetStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        let movedCount = 0;

        for (const t of targets) {
            const idx = t - 1;
            if (userStocks[idx]) {
                const stock = userStocks[idx];
                const newStatus = stock.status === 'Ready' ? 'Not Ready' : 'Ready';
                await db.updateStockStatus(stock.id, newStatus);
                movedCount++;
            }
        }

        if (movedCount > 0) {
            reply(msg, `✅ Berhasil memindahkan status ${movedCount} barang milik *${user.name}*.`);
        } else {
            reply(msg, "❌ Nomor barang tidak ditemukan atau tidak valid.");
        }

    } catch (e) {
        console.error("Gagal memindah stok:", e);
        reply(msg, "❌ Terjadi kesalahan saat memindahkan stok.");
    }

};

module.exports = { execute };
