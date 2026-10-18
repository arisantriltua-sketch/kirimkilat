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

## 6. Solusi Error "MIME type (application/octet-stream) /src/main.tsx"

Jika di browser muncul pesan:
> `Loading module from "https://kirim.sayuti.com/src/main.tsx" was blocked because of a disallowed MIME type ("application/octet-stream")`

Penyebabnya adalah **browser menerima `index.html` mentah dari root folder proyek**, bukan `dist/index.html` hasil build. Hal ini terjadi karena salah satu dari 2 hal berikut:

### Penyebab 1: Nginx Menunjuk ke Root Proyek (Bukan Proxy ke Express atau Bukan ke folder dist)
Jika konfigurasi Nginx Anda memiliki:
```nginx
# ❌ SALAH (Menyajikan index.html mentah yang memanggil /src/main.tsx):
root /path/to/project;
try_files $uri $uri/ /index.html;
```

**✅ SOLUSI BENAR A (Gunakan Nginx Full Reverse Proxy ke Node.js):**
Serahkan seluruh penyajian ke aplikasi Express (PM2):
```nginx
server {
    server_name kirim.sayuti.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Wajib untuk realtime Live GPS Kurir (SSE)
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```

**✅ SOLUSI BENAR B (Jika Nginx Menyajikan Static Langsung):**
Arahkan root Nginx ke subfolder **`/dist`**, BUKAN root repositori:
```nginx
server {
    server_name kirim.sayuti.com;
    root /path/to/project/dist; # <-- Wajib berakhiran /dist
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API dan SSE tetap diarahkan ke PM2 Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_buffering off;
        proxy_read_timeout 86400s;
    }
}
```

### Penyebab 2: Belum Melakukan Build atau PM2 Belum Direstart
Di terminal server/VPS Anda:
```bash
# 1. Hentikan proses lama
pm2 stop all

# 2. Jalankan build frontend
npm run build

# 3. Jalankan kembali dengan PM2
npm run pm2:start

# 4. Bersihkan cache browser (Ctrl + Shift + R di browser)
```
