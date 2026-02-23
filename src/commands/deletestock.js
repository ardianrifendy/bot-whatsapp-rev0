const db = require('../db');
const { reply } = require('../utils/helpers');

const execute = async (msg, args) => {
    // !ds Rina 1,2
    if (args.length < 3) return reply(msg, "❌ Format salah. Contoh: !ds Rina 1 atau !ds Rina 1,2");

    const userName = args[1];
    const targetStr = args[2];

    try {
        const user = await db.getUserByName(userName);
        if (!user) return reply(msg, `❌ User *${userName}* tidak ditemukan.`);

        const userStocks = await db.getStocksByUser(user.id);
        if (userStocks.length === 0) return reply(msg, `📭 User *${user.name}* tidak memiliki barang.`);

        const targets = targetStr.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        let delCount = 0;

        for (const t of targets) {
            const idx = t - 1;
            if (userStocks[idx]) {
                const stock = userStocks[idx];
                await db.deleteStock(stock.id);
                delCount++;
            }
        }

        if (delCount > 0) {
            reply(msg, `🗑️ Berhasil menghapus ${delCount} barang milik *${user.name}*.`);
        } else {
            reply(msg, "❌ Nomor barang tidak ditemukan atau tidak valid.");
        }

    } catch (e) {
        console.error("Gagal mendelete stok:", e);
        reply(msg, "❌ Terjadi kesalahan saat menghapus stok.");
    }
};

module.exports = { execute };
