const { reply } = require('../utils/helpers');

const execute = async (msg, args, client, text, lines) => {
    try {
        const chat = await msg.getChat();
        // Ambil 100 pesan terakhir di chat ini
        const messages = await chat.fetchMessages({ limit: 100 });

        // Saring hanya pesan yang dikirim oleh bot
        const botMessages = messages.filter(m => m.fromMe);

        if (botMessages.length === 0) {
            return reply(msg, "📭 Tidak ada pesan bot yang bisa dihapus di sini.");
        }

        console.log(`[CLEAR] Ditemukan ${botMessages.length} pesan bot.`);

        let deletedCount = 0;
        for (const botMsg of botMessages) {
            try {
                await botMsg.delete(true);
                deletedCount++;
                // Beri jeda 500ms agar grup WhatsApp tidak mengabaikan request hapus beruntun (rate limit UI)
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
                console.error(`Gagal menghapus pesan ID ${botMsg.id._serialized}:`, e.message);
            }
        }

        console.log(`[CLEAR] Terhapus ${deletedCount} pesan.`);

        // Hapus juga command !clear nya jika command tersebut juga dari bot (apabila user testing di 'messages to myself')
        if (msg.fromMe) {
            await msg.delete(true);
        }

        const sentMsg = await reply(msg, `✅ Berhasil membersihkan ${deletedCount} pesan bot.`);
        setTimeout(() => { if (sentMsg && sentMsg.delete) sentMsg.delete(true); }, 3000); // hilang dalam 3 detik

    } catch (error) {
        console.error("Gagal membersihkan pesan chat:", error);
        reply(msg, "❌ Terjadi kesalahan saat mencoba membersihkan pesan.");
    }
};

module.exports = { execute };
