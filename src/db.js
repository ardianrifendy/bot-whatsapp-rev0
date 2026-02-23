const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure db directory exists
const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'bot.db');
const db = new sqlite3.Database(dbPath);

// Initialize Tables
db.serialize(() => {
    // Tabel Riwayat (History)
    db.run(`CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_jid TEXT NOT NULL,
        courier TEXT NOT NULL,
        awb TEXT NOT NULL,
        hp TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_jid, courier, awb)
    )`);

    // Tambah kolom hp jika db sudah pernah dibuat sebelumnya (SQLite Alter Table bersifat Add jika berhasil)
    db.all("PRAGMA table_info(history)", (err, rows) => {
        if (!err && !rows.some(row => row.name === 'hp')) {
            db.run(`ALTER TABLE history ADD COLUMN hp TEXT DEFAULT ''`);
        }
    });
    db.all("PRAGMA table_info(active_tracks)", (err, rows) => {
        if (!err && !rows.some(row => row.name === 'hp')) {
            db.run(`ALTER TABLE active_tracks ADD COLUMN hp TEXT DEFAULT ''`);
        }
    });

    // Tabel Pengecekan Aktif (Active Tracks)
    db.run(`CREATE TABLE IF NOT EXISTS active_tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_jid TEXT NOT NULL,
        courier TEXT NOT NULL,
        awb TEXT NOT NULL,
        hp TEXT DEFAULT '',
        last_status TEXT,
        last_checked DATETIME,
        UNIQUE(user_jid, courier, awb)
    )`);

    // ==========================================
    // MODULE: STOCK OPNAME
    // ==========================================

    // Tabel Pengguna Terdaftar
    db.run(`CREATE TABLE IF NOT EXISTS app_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL COLLATE NOCASE
    )`);

    // Tabel Stok Barang
    db.run(`CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        item_name TEXT NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('Ready', 'Not Ready')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES app_users(id)
    )`);
});

/**
 * Functions to interact with history
 */
const addHistory = (user_jid, courier, awb, hp = '') => {
    return new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO history (user_jid, courier, awb, hp) VALUES (?, ?, ?, ?)',
            [user_jid, courier, awb, hp],
            function (err) {
                if (err) reject(err);
                else {
                    // Update HP if exists and not empty
                    if (hp) {
                        db.run('UPDATE history SET hp = ? WHERE user_jid = ? AND courier = ? AND awb = ?',
                            [hp, user_jid, courier, awb]);
                    }
                    resolve(this.lastID);
                }
            });
    });
};

const getHistory = (user_jid) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM history WHERE user_jid = ? ORDER BY created_at ASC', [user_jid], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const deleteHistory = (user_jid, id = null) => {
    return new Promise((resolve, reject) => {
        let query = 'DELETE FROM history WHERE user_jid = ?';
        let params = [user_jid];

        if (id !== null) {
            query += ' AND id = ?';
            params.push(id);
        }

        db.run(query, params, function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

/**
 * Functions to interact with active tracks
 */
const addActiveTrack = (user_jid, courier, awb, hp = '', last_status = '') => {
    return new Promise((resolve, reject) => {
        db.run('INSERT OR REPLACE INTO active_tracks (user_jid, courier, awb, hp, last_status, last_checked) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
            [user_jid, courier, awb, hp, last_status],
            function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
    });
};

const updateActiveTrackStatus = (user_jid, courier, awb, new_status) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE active_tracks SET last_status = ?, last_checked = CURRENT_TIMESTAMP WHERE user_jid = ? AND courier = ? AND awb = ?',
            [new_status, user_jid, courier, awb],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
};

const removeActiveTrack = (user_jid, courier, awb) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM active_tracks WHERE user_jid = ? AND courier = ? AND awb = ?',
            [user_jid, courier, awb],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes);
            });
    });
};

const getAllActiveTracks = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM active_tracks', [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// ==========================================
// DB WRAPPER: STOCK OPNAME
// ==========================================

const addUser = (name) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO app_users (name) VALUES (?)', [name], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    resolve({ success: false, message: 'Nama user sudah terdaftar.' });
                } else {
                    reject(err);
                }
            } else {
                resolve({ success: true, id: this.lastID });
            }
        });
    });
};

const getUserByName = (name) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM app_users WHERE name = ? COLLATE NOCASE', [name], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const addStock = (userId, itemName, status) => {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO stocks (user_id, item_name, status) VALUES (?, ?, ?)',
            [userId, itemName, status], function (err) {
                if (err) reject(err);
                else resolve(this.lastID);
            });
    });
};

const getStocksByUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM stocks WHERE user_id = ? ORDER BY status DESC, id ASC', [userId], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
};

const getAllUsersAndStocks = () => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT u.name as user_name, s.id as stock_id, s.item_name, s.status 
            FROM app_users u 
            LEFT JOIN stocks s ON u.id = s.user_id 
            ORDER BY u.name ASC, s.status DESC, s.id ASC
        `, [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows || []);
        });
    });
};

const updateStockStatus = (stockId, status) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE stocks SET status = ? WHERE id = ?', [status, stockId], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

const renameStock = (stockId, newName) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE stocks SET item_name = ? WHERE id = ?', [newName, stockId], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

const deleteStock = (stockId) => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM stocks WHERE id = ?', [stockId], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
};

module.exports = {
    addHistory,
    getHistory,
    deleteHistory,
    addActiveTrack,
    updateActiveTrackStatus,
    removeActiveTrack,
    getAllActiveTracks,

    // Exports Stock Opname
    addUser,
    getUserByName,
    addStock,
    getStocksByUser,
    getAllUsersAndStocks,
    updateStockStatus,
    renameStock,
    deleteStock
};
