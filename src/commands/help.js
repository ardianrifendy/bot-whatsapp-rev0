const { reply } = require('../utils/helpers');

const execute = async (msg, args, client, text, lines) => {
    const helpText = `🤖 *PANDUAN BOT TRACKING RESI & STOK*
━━━━━━━━━━━━━━━━━━

🟢 *1. MELACAK RESI BARU*
Ketik \`!cekresi\` lalu nama kurir & nomor resi.
Contoh: \`!cekresi jnt 987654321\`
_(Khusus JNE wajib +5 angka terakhir No HP: \`!cekresi jne 12345 08123\`)_

👉 *Banyak Resi Sekaligus:*
\`\`\`!cekresi
jne 1234567890 08123
jnt 9876543210
spx SPX01234567\`\`\`

🟡 *2. MELIHAT HISTORI RESI*
Ketik \`!h\` atau \`!history\` untuk melihat riwayat resi Anda.
- Ketik \`!ch 1\` untuk cek ulang resi No 1.
- Ketik \`!h delete 1\` untuk menghapus histori No 1.

📦 *3. STOCK OPNAME (PENCATATAN BARANG)*
- \`!adduser <Nama>\`: Mendaftarkan buku stok untuk user.
- \`!addready <Nama> <Barang>\`: Tambah barang ke stok Gudang (Bisa multi-baris).
- \`!addnotready <Nama> <Barang>\`: Tambah ke stok Di Jalan.
- \`!list\`: Lihat seluruh daftar stok yang tercatat.
- \`!move <Nama> <Angka>\`: Ubah status Ready/Di Jalan.
- \`!renameready <Nama> <Angka> <Barang Baru>\`: Ganti nama. (Pakai !renamenotready jika di jalan).
- \`!ds <Nama> <Angka>\`: Menghapus data barang.

🟣 *4. MANAJEMEN PESAN*
🧹 \`!c\` / \`!clear\` : Hapus pesan otomatis bot.
🗑️ \`!del\` / \`!d\`  : Reply pesan bot/orang & hapus (Butuh Admin).

━━━━━━━━━━━━━━━━━━
💡 _Bot akan otomatis mengirimkan notifikasi resi jika ada pergerakan status setiap 1 Jam._`;

    return reply(msg, helpText.trim());
};

module.exports = { execute };
