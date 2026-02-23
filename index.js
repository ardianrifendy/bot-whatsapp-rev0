const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' })
});

// Event: QR Code received
client.on('qr', (qr) => {
    console.log('Scan QR Code ini untuk login bot:');
    qrcode.generate(qr, { small: true });
});

// Event: Client Ready
client.on('ready', () => {
    console.log('Bot WhatsApp sudah terhubung dan siap digunakan!');

    // Mulai Scheduler setelah bot ready
    const scheduler = require('./src/scheduler');
    scheduler.start(client);
});

// Map commands to their execution files
const commandsMap = {
    '!cekresi': require('./src/commands/cekresi'),
    '!track': require('./src/commands/cekresi'),
    '!cek': require('./src/commands/cekresi'),
    '!history': require('./src/commands/history'),
    '!h': require('./src/commands/history'),
    '!ch': require('./src/commands/historyCheck'),
    '!c': require('./src/commands/clear'),
    '!clear': require('./src/commands/clear'),
    '!delete': require('./src/commands/delete'),
    '!del': require('./src/commands/delete'),
    '!d': require('./src/commands/delete'),
    '!help': require('./src/commands/help'),
    '!bantuan': require('./src/commands/help'),
    '!restartbot': require('./src/commands/restart'),

    // --- Stock Opname Commands ---
    '!adduser': require('./src/commands/adduser'),
    '!addready': require('./src/commands/addstock'),
    '!tambahready': require('./src/commands/addstock'),
    '!addnotready': require('./src/commands/addstock'),
    '!tambahdijalan': require('./src/commands/addstock'),
    '!liststock': require('./src/commands/liststock'),
    '!list': require('./src/commands/liststock'),
    '!l': require('./src/commands/liststock'),
    '!move': require('./src/commands/movestock'),
    '!deletestock': require('./src/commands/deletestock'),
    '!delstok': require('./src/commands/deletestock'),
    '!ds': require('./src/commands/deletestock'),
    '!renameready': require('./src/commands/renamestock'),
    '!renamenotready': require('./src/commands/renamestock')
};

// Event: Message received
client.on('message', async (msg) => {
    const text = msg.body;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return;

    // Toleransi spasi pada prefix `! command` dengan menghapus spasi pertama setelah tanda seru di awal text
    let firstLine = lines[0];
    if (firstLine.startsWith('! ')) {
        firstLine = '!' + firstLine.slice(2).trim();
    }

    const args = firstLine.split(' ');
    const command = args[0].toLowerCase();

    // Exception override array check untuk command history delete (!h delete)
    let targetCommand = command;
    if ((command === '!h' || command === '!history') && args[1]?.toLowerCase() === 'delete') {
        targetCommand = '!h delete';
    }

    try {
        if (targetCommand === '!h delete') {
            const historyDelete = require('./src/commands/historyDelete');
            return await historyDelete.execute(msg, args, client, text, lines);
        }

        // Panggil command module jika ada
        if (commandsMap[targetCommand]) {
            return await commandsMap[targetCommand].execute(msg, args, client, text, lines);
        }
    } catch (e) {
        console.error("Terjadi kesalahan sistem saat mengeksekusi komando modul:", e);
    }
});

client.initialize();
