const db = require('../db');
const { reply } = require('../utils/helpers');

const execute = async (msg, args) => {
    // !renameready Rina 2 Nama Baru Yang Panjang
    // atau !renamenotready
    const commandName = args[0].toLowerCase();
    const targetedStatus = (commandName === '!renameready') ? 'Ready' : 'Not Ready';

    if (args.length < 4) return reply(msg, "❌ Format salah. Contoh: !renameready Rina 1 Keyboard Eksternal");

    const userName = args[1];
    const targetIdx = parseInt(args[2]);
    const newName = args.slice(3).join(' ');

    if (isNaN(targetIdx)) return reply(msg, "❌ Angka urutan barang tidak valid.");

    try {
        const user = await db.getUserByName(userName);
        if (!user) return reply(msg, `❌ User *${userName}* tidak ditemukan.`);

        // Karena `!list` mengeluarkan SATU list yang merangkum Ready & NotReady berdasarkan 1 urutan Index.
        // Konsep bot ini berdasar angka List utama. Namun, user mintanya dipisah 'renameready' dan 'renamenotready'.
        // Kita akan cek status aslinya berdasarkan Index List agar aman.
        const userStocks = await db.getStocksByUser(user.id);
        const stockIndex = targetIdx - 1;

        if (!userStocks[stockIndex]) {
            return reply(msg, "❌ Nomor barang tidak ditemukan di list milik user tersebut.");
        }

        const exactStock = userStocks[stockIndex];

        // Verifikasi apakah dia mengeksekusi di perintah yang sesuai
        if (exactStock.status !== targetedStatus) {
            return reply(msg, `❌ Gagal: Nama yang ingin diganti berstatus *${exactStock.status}*, tetapi Anda menggunakan perintah *${commandName}*.`);
        }

        await db.renameStock(exactStock.id, newName);
        reply(msg, `✏️ Nama barang *${exactStock.status}* no ${targetIdx} milik *${user.name}* berhasil diubah menjadi **${newName}**.`);

    } catch (e) {
        console.error("Gagal merename stok:", e);
        reply(msg, "❌ Terjadi kesalahan saat merename stok.");
    }
};

module.exports = { execute };
