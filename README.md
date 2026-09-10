# 🖐️ HandsOf — See the Hands Behind the Craft

> **Smart India Hackathon 2025**  
> **Problem Statement ID**: SIH26090  
> **Theme**: Heritage & Culture | **Category**: Software  
> **Team**: Code Pragya  

---

## 📖 About HandsOf

**HandsOf** is an AI-driven digital business manager and smart cataloging mobile & web platform designed specifically for marginalized Indian artisans and handloom weavers.

By combining **zero-form multilingual voice interactions**, **AI-powered product photography & studio relighting**, and direct **ONDC/GeM marketplace integration**, HandsOf enables low-digital-literacy artisans to independently digitize, price, and sell their authentic handcrafted heritage goods nationwide and globally without middleman exploitation.

---

## 🚀 Key Features

### 1. 🎙️ Zero-Form Voice-First Onboarding & Navigation
- Designed for low-literacy and first-time smartphone users.
- Native speech support in **Hindi, Marathi, and English**.
- Voice dictation for artisan details and catalog search with real-time waveform cues and audio narration (`बोलकर सुनें`).

### 2. 📸 Module 1: AI Product Studio
- **Dual Capture**: Live smartphone camera with framing alignment guide or gallery upload.
- **Computer Vision Pipeline**: Semantic background segmentation (U-Net/adaptive alpha matting) + exposure normalization + studio pedestal drop shadow.
- **4 Studio Lighting Presets**:
  - 🏛️ *Luxury Boutique*: Clean marble pedestal with softbox studio lighting.
  - 🏺 *Terracotta Warm*: Earthy sunlit gradient celebrating clay & terracotta.
  - ✨ *Festival Deep Glow*: Rich ambient festive lighting for decorative crafts.
  - ⚪ *Clean ONDC White*: Minimal pure white catalog specification.
- **Before ⟷ After Comparison**: Interactive draggable split slider showing amateur workshop capture vs. studio shot.

### 3. ⚖️ AI Fair Price Recommendation Engine
Protects marginalized artisans from underpricing:
$$\text{Fair Retail Price} = \text{Raw Materials Cost} + (\text{Artisan Working Hours} \times \text{Fair Living Wage}) + \text{Cultural Heritage Margin}$$

### 4. 🖐️ "See the Hands Behind the Craft" (Provenance Storytelling)
- Every product card links the consumer directly to the verified maker profile.
- Displays artisan bio, geographical cluster (e.g., Paithani Handloom Cluster, Maharashtra), and **GI Tag certification** (GI-38).
- **100% Direct-to-Artisan Payout Guarantee**.

### 5. 🌐 ONDC & GeM Digital Commerce Ready
- Full **Beckn Protocol v1.2.0** compliant catalog export (`ONDC:RET12`).
- 1-click **Download ONDC JSON** (`HandsOf_ONDC_Catalog.json`) and Beckn payload inspector.
- Real-time synchronization with **Supabase Cloud PostgreSQL**.

---

## 🛠️ Architecture & Tech Stack

```
Frontend (React 18 + Vite) ─── Port 5173 ───> Modern responsive Web / Mobile UX
Backend API (Node.js + Express) ─ Port 5000 ───> Supabase DB & Cloud Proxy
AI Engine (Python 3.12 + FastAPI) ─ Port 8000 ─> Computer Vision & Studio Relighting
Database ───────────────────────────────────> Supabase Cloud PostgreSQL
Marketplace Integration ────────────────────> ONDC Beckn Protocol v1.2.0 / GeM
```

---

## 💻 Local Setup Guide

### 1. Install Node.js Dependencies
```bash
npm install
cd server && npm install && cd ..
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```

### 3. Start the Services
- **Python AI Microservice**:
  ```bash
  python ai_service/app.py
  ```
- **Node.js Backend**:
  ```bash
  node server/server.js
  ```
- **Vite Web Frontend**:
  ```bash
  npm run dev -- --host
  ```

Open [http://localhost:5173/](http://localhost:5173/) to access the application.

---

## 👥 Team Code Pragya
Developed with ❤️ for the artisans and weavers of India at **Smart India Hackathon 2025**.
