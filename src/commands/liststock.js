const db = require('../db');
const { reply } = require('../utils/helpers');

const execute = async (msg, args) => {
    try {
        const data = await db.getAllUsersAndStocks();
        if (!data || data.length === 0) {
            return reply(msg, "📭 Sistem stok masih kosong.");
        }

        let responseText = "📦 *LAPORAN STOK BARANG*\n━━━━━━━━━━━━━━━━━━\n";

        let currentUser = '';
        let itemIndex = 1;

        for (const row of data) {
            // Header User
            if (row.user_name !== currentUser) {
                if (currentUser !== '') responseText += '\n'; // spacing
                responseText += `👤 *User: ${row.user_name}*\n`;
                currentUser = row.user_name;
                itemIndex = 1; // reset hitungan untuk next user
            }

            // Is ada barangnya?
            if (row.item_name) {
                const statusIcon = row.status === 'Ready' ? '🟢 Ready' : '🟡 Di Jalan';
                responseText += `${itemIndex}. ${row.item_name} (${statusIcon})\n`;
                itemIndex++;
            } else {
                responseText += `_(Belum ada stok)_\n`;
            }
        }

        reply(msg, responseText.trim());

    } catch (e) {
        console.error("Gagal menarik laporan:", e);
        reply(msg, "❌ Terjadi kesalahan sistem saat menarik data stok.");
    }
};

module.exports = { execute };
