# KIRAFOREX Digital Platform & CMS

Official web ecosystem and executive content management system for **KIRAFOREX** (CEO of Kiraforex Trading Academy & Founder of Africa's Female Forex Traders).

---

## 🚀 How to Run Locally

You can launch both the **Public Website** and the **Private Admin CMS** with a single click or command:

### Option 1: Double-Click Runner (Windows)
Double-click `start-dev.bat` in the project root.
- Detects your Node.js runtime automatically.
- Launches both servers simultaneously.

### Option 2: Command Line (CMD / PowerShell / Terminal)
```bash
# In the project root (D:\kirafx)
npm start
```
*Or directly via Node:*
```bash
node server.js
```

### Option 3: PowerShell Script
```powershell
.\start-dev.ps1
```

---

## 🌐 Local Access URLs

Once launched:
- **Public Website**: [http://localhost:3000](http://localhost:3000)
- **Admin CMS Dashboard**: [http://localhost:3001](http://localhost:3001)

---

## 🎨 Features & Capabilities

### Public Website (`http://localhost:3000`)
- **Signature Hero Section**:
  - Founder cutout portrait with transparent background.
  - Interactive mouse parallax on official partner badges (TradingView, Deriv, MetaTrader 5).
  - Continuous 360° orbiting neon comet glow light.
  - One-click Deriv partner account creation button.
- **Academy Courses & Mentorship**: Dynamic catalog synced directly from CMS.
- **Workshops & Live Classes**: Full native 818:1024 aspect-ratio event flyer display.
- **Trading Tools Hub**:
  - Position size calculator
  - Risk-to-reward ratio & breakeven win rate calculator
  - Pip value calculator
  - Sentiment & checklist tools
- **YouTube Media Showcase**: 1 row × 3 column responsive video cards.
- **Floating WhatsApp Live Chat**: One-click instant support contact button fixed to the bottom-right corner.

### Admin CMS Dashboard (`http://localhost:3001`)
- **Executive Analytics**: Live KPI counters, student program demand charts, real-time activity audit trail.
- **Academy Programs Manager**: Create, edit, price, and manage courses and VIP mentorships.
- **Events & Workshops Manager**: Upload event flyers with automatic thumbnail generation.
- **Student Leads & CRM**:
  - Clear bordered, responsive admissions table.
  - Status management (New, Contacted, Enrolled, Archived).
  - One-click WhatsApp student chat.
  - Safety-confirmed permanent lead deletion.
- **Full Website Customizer**:
  - **Theme & Colors**: 1-click presets (Emerald, Imperial Gold, Cyan, Obsidian Dark), custom hex color pickers, and light/dark canvas modes.
  - **Typography Engine**: Choose heading & body fonts from Google Fonts with global scale sizing and live preview.
  - **Hero & Content Engine**: Edit all headlines, stats, buttons, links, bio stories, philosophy cards, and upload new transparent hero photos.
- **Brand & Social Links**: Configure official Telegram, WhatsApp, YouTube, and Deriv partner links.

---

## ☁️ Deploying to Vercel

The project includes `vercel.json` configured for serverless deployment:

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete platform ready for local and cloud"
   git push origin main
   ```
2. Import the repository on [vercel.com](https://vercel.com).
3. Vercel automatically deploys using the `@vercel/node` serverless runtime.
