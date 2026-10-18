# Panduan Menjalankan Aplikasi KirimKilat dengan PM2

Aplikasi ini menggunakan Express (`server.ts`) yang melayani API backend, WebSocket/SSE real-time kurir, dan antarmuka web Vite React.

File konfigurasi PM2 telah disiapkan di `ecosystem.config.cjs`.

---

## 1. Persiapan Awal di Server / VPS

Pastikan Node.js (v18+) dan PM2 sudah terpasang di VPS/Server:
```bash
# Cek versi node & npm
node -v
npm -v

# Pasang PM2 secara global jika belum terpasang
npm install -g pm2
```

---

## 2. Salin Konfigurasi Environment (`.env`)

Pastikan file `.env` sudah diisi dengan kredensial database MySQL Anda:
```bash
cp .env.example .env
nano .env
```

Contoh konfigurasi `.env`:
```env
PORT=3000
NODE_ENV=production

# Database MySQL Percetakan
DB_CONNECTION=mysql
DB_HOST=posapp.hostr.my.id
DB_PORT=3306
DB_DATABASE=db_print_new
DB_USERNAME=db_print_new
DB_PASSWORD=rahasia_password_anda
```

---

## 3. Install Dependencies & Build Frontend

Sebelum menyalakan aplikasi di mode produksi, lakukan build frontend terlebih dahulu:
```bash
# Pasang dependensi
npm install

# Build file frontend ke folder dist/
npm run build
```

---

## 4. Menjalankan Aplikasi dengan PM2

Anda dapat langsung menggunakan perintah npm yang telah ditambahkan atau memanggil PM2 langsung:

### Opsi A: Menggunakan File `ecosystem.config.cjs` (Direkomendasikan)
```bash
# Menjalankan di mode produksi
pm2 start ecosystem.config.cjs --env production

# Atau via npm script:
npm run pm2:start
```

### Opsi B: Menjalankan via npm start
```bash
pm2 start npm --name "kirimkilat" -- start
```

---

## 5. Perintah Manajemen PM2

```bash
# Melihat status proses
pm2 status

# Melihat log aplikasi secara realtime
pm2 logs kirimkilat

# Restart aplikasi (misal setelah ubah .env atau update kode)
pm2 restart kirimkilat

# Stop aplikasi
pm2 stop kirimkilat

# Simpan daftar proses agar otomatis hidup saat server reboot
pm2 save
pm2 startup
```

---

## 6. Konfigurasi Nginx Reverse Proxy (Opsional untuk Domain/SSL)

Jika menggunakan Nginx sebagai reverse proxy ke port 3000:

```nginx
server {
    listen 80;
    server_name kirimkilat.domainanda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Dukungan untuk SSE (Server-Sent Events) live GPS kurir
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```
