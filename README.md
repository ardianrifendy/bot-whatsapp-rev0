# WhatsApp Resi Tracking & Stock Opname Bot 📦🤖

Sebuah bot WhatsApp canggih berbasis Node.js (`whatsapp-web.js`) yang dirancang untuk mempermudah pelacakan resi ekspedisi secara otomatis dan manajemen stok barang (Stock Opname) untuk tim kecil hingga menengah.

## ✨ Fitur Utama

### 1. Pelacakan Resi Otomatis (Auto-Check)
- **Multi-Tracker:** Lacak puluhan resi dari berbagai ekspedisi dalam satu kali perintah.
- **Auto-Notification (Cron Job):** Bot akan mengecek status resi aktif setiap 1 Jam. Jika paket berpindah alamat atau kurir, bot akan mengirim notifikasi WhatsApp otomatis kepada Anda.
- **Histori Database:** Riwayat pencarian tersimpan di database SQLite lokal. Anda tidak perlu mengetik nomor resi panjang berulang kali; cukup panggil nomor historinya.

### 2. Manajemen Stok Barang (Stock Opname)
Aplikasi kasir/gudang mini di dalam chat WhatsApp.
- **Pemilik Laci Barang (Multi-user):** Buat laci inventori terpisah untuk tiap anggota tim.
- **2 Kategori Status:** Pantau barang yang sudah tersimpan (`Ready`) maupun barang yang masih (`Dalam Pengiriman/Di Jalan`).
- **Laporan Dinamis (List):** Menampilkan seluruh rekapitulasi daftar stok secara instan, lengkap dengan _sorting_ cerdas yang memprioritaskan stok _Ready_ di urutan teratas.

## 🚀 Cara Instalasi (Deployment)

### Persyaratan Sistem
1. [Node.js](https://nodejs.org/) terinstall di server/komputer Anda.
2. Library `git` (Opsional).
3. API Key aktif dari [BinderByte](https://binderbyte.com/) (Dibutuhkan untuk akses pelacakan kurir).

### Langkah Menjalankan Bot
1. **Clone repository ini:**
   ```bash
   git clone https://github.com/ardianrifendy/bot-whatsapp-rev0.git
   cd bot-whatsapp-rev0
   ```

2. **Install semua _dependencies_:**
   ```bash
   npm install
   ```

3. **Masukkan Token API Anda:**
   Buat file baru bernama `.env` di folder utama aplikasi, lalu masukkan token API BinderByte Anda:
   ```env
   BINDERBYTE_API_KEY=MASUKKAN_API_KEY_ANDA_DISINI
   ```

4. **Nyalakan Bot:**
   ```bash
   npm start
   ```
5. Scan **QR Code** yang muncul di Terminal menggunakan fitur _Perangkat Tertaut_ (Linked Devices) pada aplikasi WhatsApp Anda.

---

## 📖 Panduan Penggunaan (Command List)

Ketik perintah berikut dari WhatsApp untuk berinteraksi dengan Bot:

### Pelacakan Resi
- Cek 1 Resi: `!cekresi jnt 1234567890`
- Cek Banyak Resi: *(Gunakan enter/baris baru)*
  ```text
  !cekresi
  jne 123456789 08123 (Khusus JNE wajib + No HP penerima)
  spx SPX012345678
  ```
- Lihat Histori: `!h` atau `!history`
- Cek Ulang Nomor Histori: `!ch 1` atau `!ch 1,2,3`
- Hapus Histori: `!h delete 1,2` atau `!h delete all`

### Manajemen Stok (Stock Opname)
- Daftar User: `!adduser <Nama Pegawai>`
- Tambah Stok Gudang: `!addready <Nama> <Produk>`
- Tambah Stok Jalan: `!addnotready <Nama> <Produk>`
- Lihat Stok Total: `!list`
- Ubah Status *(Road -> Ready)*: `!move <Nama> <Nomor Barang di List>`
- Ganti Nama: `!renameready <Nama> <Nomor> <Nama Baru>`
- Hapus Barang: `!ds <Nama> <Nomor>`

### Perintah Sistem
- Bersihkan Chat: `!clear` (Hapus chat spam bot di grup).
- Menu Bantuan: `!help`

## 🛠️ Teknologi yang Digunakan
- **whatsapp-web.js:** Integrasi WhatsApp API (Puppeteer/Chromium)
- **SQLite3:** Database memori lokal yang ringan tanpa server.
- **Node-Cron:** Penjadwalan tugas (otomasi).
- **Axios:** Jembatan HTTP Request API.

## 🔒 Keamanan Data
File database yang menyimpan riwayat resi dan pencatatan nama stok gudang Anda (`data/bot.db`) secara tertutup telah diblokir penggunaannya ke ranah publik oleh sistem konfigurasi keamanan (.gitignore). Seluruh catatan transaksi tidak akan pernah ter-\"upload\" ke Repositori ini. Data Anda 100% aman di dalam _Local Machine_ Anda.
