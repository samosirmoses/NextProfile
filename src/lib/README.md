# 📚 Library Documentation

Folder ini berisi semua logic bisnis aplikasi yang dipecah menjadi module-module terpisah.

## 🗂️ Struktur File

```
lib/
├── constants.ts          # Konfigurasi & konstanta global
├── context-loader.ts     # Load data dari file
├── cache-manager.ts      # Kelola Gemini Context Caching
├── ai-service.ts         # Komunikasi dengan Gemini API
└── message-formatter.ts  # Format pesan jadi bubble chat
```

## 📖 Penjelasan Setiap Module

### 1. `constants.ts` - Konfigurasi Global
Berisi semua konstanta dan konfigurasi aplikasi:
- `AI_CHARACTER` - Info karakter AI assistant
- `CACHE_CONFIG` - Setting untuk context caching (model, TTL, dll)
- `MESSAGE_CONFIG` - Setting untuk pemisahan bubble chat

**Kapan edit file ini?**
- Ganti model AI
- Ubah durasi cache
- Ganti personality AI

---

### 2. `context-loader.ts` - Load Data
Membaca file `career_context.txt` dan `system_prompt.txt` saat server start.

**Cara kerja:**
```
Server Start → Load file → Cache di memory → Siap dipakai
```

**Kapan edit file ini?**
- Tambah file context baru
- Ubah format loading data

---

### 3. `cache-manager.ts` - Gemini Context Caching ⭐
Module paling penting! Menghemat token dengan cache context.

**Cara kerja:**
```
Request 1: Create cache di Gemini (1x bayar full token)
Request 2-N: Pakai cache (bayar 1/10 harga!) 
Setelah 1 jam: Cache expired, create lagi
```

**Fungsi:**
- `getOrCreateCache()` - Ambil cache existing atau buat baru
- `resetCache()` - Reset cache (jika context berubah)

**Keuntungan:**
- ✅ Hemat token 90%
- ✅ Response lebih cepat
- ✅ Cache shared untuk semua user

---

### 4. `ai-service.ts` - Komunikasi dengan API
Handle semua request ke Gemini API.

**Cara kerja:**
```
User message → Generate content (pakai cache) → Return response
```

**Parameter:**
- `apiKey` - Google API Key
- `cacheName` - Referensi ke cached context
- `userMessage` - Pertanyaan dari user

---

### 5. `message-formatter.ts` - Format Bubble Chat
Memecah pesan panjang jadi beberapa bubble agar lebih natural.

**Cara kerja:**
```
Long text → Split by paragraphs → Split by sentences → Bubble array
```

**Contoh:**
```
Input: "Halo! Nama saya Moses. Saya developer. Saya suka coding."

Output: [
  "Halo! Nama saya Moses.",
  "Saya developer. Saya suka coding."
]
```

---

## 🔄 Alur Request Lengkap

```
1. User kirim pesan
   ↓
2. API Route (route.ts)
   ↓
3. Load career context (context-loader.ts)
   ↓
4. Get/Create cache (cache-manager.ts)
   ↓
5. Generate AI response (ai-service.ts)
   ↓
6. Format jadi bubbles (message-formatter.ts)
   ↓
7. Return ke user
```

## 🎯 Keuntungan Arsitektur Ini

✅ **Mudah dibaca** - Setiap file punya 1 tanggung jawab
✅ **Mudah di-test** - Bisa test per module
✅ **Mudah di-maintain** - Edit 1 file tidak ganggu yang lain
✅ **Reusable** - Fungsi bisa dipakai di tempat lain
✅ **Hemat token** - Pakai context caching

## 🚀 Tips untuk Pemula

1. **Baca file dari atas ke bawah** - Dimulai dari `constants.ts`
2. **Lihat flow request** - Baca alur di atas
3. **Coba edit constants** - Ganti TTL atau max bubbles
4. **Lihat console log** - Ada emoji untuk tracking (✅, 🔄, ❌)

## 📝 Contoh Penggunaan

```typescript
// Contoh pakai di tempat lain (misal: API route lain)
import { loadCareerContext } from "@/lib/context-loader";
import { getOrCreateCache } from "@/lib/cache-manager";

const context = loadCareerContext();
const cache = await getOrCreateCache(apiKey, context);
```

## 🔧 Environment Variables

Pastikan `.env.local` punya:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

---

Dibuat dengan ❤️ untuk memudahkan development

