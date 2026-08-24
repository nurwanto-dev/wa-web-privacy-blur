# Privacy Blur - Chat Blocker

Ekstensi Chrome untuk memblurkan konten chat (nama kontak, pesan, foto profil) dan menampilkannya kembali saat di-hover atau diklik.

## Fitur

- Blur nama kontak, pesan chat, dan foto profil di situs chat (WhatsApp Web, Telegram Web, Discord, Messenger, dll.)
- Konten muncul saat **di-hover** (default) atau saat **di-klik**
- Hanya berjalan di situs chat — tidak menyentuh situs lain (bisa diubah ke semua situs)
- Tombol "Tambahkan situs ini" untuk domain custom
- Aman: murni berjalan di browser (client-side), tidak mengirim data ke mana pun

## Cara Install

1. Buka Chrome dan masuk ke halaman ekstensi: ketik `chrome://extensions` di address bar
2. Aktifkan **Developer mode** (toggle di pojok kanan atas)
3. Klik tombol **Load unpacked**
4. Pilih folder ekstensi ini (`extention-chrome`)
5. Ekstensi **Privacy Blur** akan muncul dan langsung aktif

> Setelah terpasang, developer mode boleh dimatikan — ekstensi tetap berfungsi. Nyalakan kembali hanya jika ingin reload/update kode.

## Cara Pakai

1. Buka **WhatsApp Web** (web.whatsapp.com) atau situs chat lain
2. Kontak, pesan, dan foto profil otomatis terblur
3. Arahkan kursor (hover) ke elemen yang terblur untuk melihat isinya — elemen akan terbuka kembali
4. Saat kursor meninggalkan elemen, konten terblur lagi

### Mengatur melalui Popup

Klik ikon ekstensi **Privacy Blur** di toolbar untuk membuka pengaturan:

| Pengaturan | Fungsi |
|---|---|
| **Aktifkan Blur** | Master toggle on/off |
| **Nama kontak** | Blur nama kontak/pengirim |
| **Pesan chat** | Blur isi pesan |
| **Foto profil** | Blur avatar/foto profil |
| **Di-hover / Di-klik** | Cara menampilkan konten yang terblur |
| **Hanya situs chat / Semua situs** | Batasi blur ke situs chat saja atau semua situs |
| **Tambahkan situs ini** | Tambahkan domain situs saat ini ke daftar yang diblurkan |

## Struktur File

```
extention-chrome/
├── manifest.json    # Konfigurasi ekstensi (Manifest V3)
├── content.js       # Logika blur + reveal + pemantauan DOM
├── popup.html       # Tampilan popup pengaturan
├── popup.css        # Style popup
├── popup.js         # Logika popup (simpan pengaturan)
└── icons/           # Ikon ekstensi (16/48/128 px)
```

## Cara Update Kode

Setelah mengubah file, muat ulang ekstensi:

1. Buka `chrome://extensions`
2. Pastikan **Developer mode** aktif
3. Klik ikon **reload** (panah melingkar) pada kartu Privacy Blur
4. Refresh halaman chat di browser

## Penyelesaian Masalah

- **Blur tidak muncul?** Pastikan toggle "Aktifkan Blur" menyala dan situs termasuk daftar chat (atau pilih "Semua situs").
- **Situs chat custom tidak terblur?** Buka situsnya, klik popup ekstensi, lalu klik **Tambahkan situs ini**.
- **Konten tidak terblur setelah scroll?** Tunggu ±1 detik — konten baru otomatis diblurkan kembali oleh ekstensi.

## Catatan Privasi

Ekstensi ini tidak mengirim atau menyimpan data apa pun. Semua proses blur dilakukan lokal di browser Anda. Penggunaan di situs pihak ketiga (seperti WhatsApp) tunduk pada ketentuan layanan situs tersebut.
