# 🛠️ Toollix.io — The Ultimate Open-Source Online Toolkit

[![Deployment Status](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel&logoColor=white&style=flat-square)](https://toollix.io)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.2-black?logo=next.js&style=flat-square)](https://nextjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Modern-38B2AC?logo=tailwind-css&style=flat-square)](https://tailwindcss.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg?style=flat-square)](LICENSE)

Toollix.io is a premium, all-in-one suite of over 85+ free online tools designed for creators, developers, and power users. From digital document signing to AI-powered image enhancement, Toollix provides a secure, lightning-fast, and professional experience without watermarks, ads, or hidden fees.

Everything runs on a modern, responsive interface built with Next.js, with server-side processing for complex tools and client-side processing for instant utilities.

---

## 📸 Screenshots

*Below are screenshots of the Toollix.io interface in action (placeholders for repository preview):*

| **Dashboard Overview** | **PDF Sign & Studio** |
|:---:|:---:|
| ![Dashboard Preview](/public/screenshots/dashboard.png) | ![PDF Editor Preview](/public/screenshots/pdf-editor.png) |

| **AI Background Remover** | **Developer Utilities** |
|:---:|:---:|
| ![AI Remover Preview](/public/screenshots/bg-remover.png) | ![JSON Formatter Preview](/public/screenshots/json-formatter.png) |

---

## 🚀 Key Features & Categories

Toollix is loaded with a collection of **87+ tools** organized across five key categories:

### 📄 PDF Mastery & Document Suite
* **Sign PDF**: In-memory document signing with custom signature placement, resizing, and optional audit trails. 100% private.
* **Merge, Split & Compress**: High-performance PDF processing using `pdf-lib`.
* **OCR (Optical Character Recognition)**: Extract text from scanned documents and images.
* **Format Conversions**: Seamless conversion utility including Word to PDF, Image to PDF, EPUB Converter, and PDF to Word.
* **Specialty Layouts**: PDF to Booklet creator for printable layouts.

### 🖼️ AI Image Processing
* **AI Upscaler**: Increase image resolution with neural networks.
* **Background Remover**: One-click professional subject isolation.
* **Photo Enhancer**: Advanced color filters, contrast adjustments, and sharpening algorithms.
* **Utilities**: Crop, Resize, Combine, Flip, Invert, Passport Photo Maker, and Image-to-ASCII converter.
* **Social Tools**: YouTube Thumbnail Downloader, Screenshot Beautifier, and Thumbnail Maker.

### 💻 Developer Utilities
* **JSON & SQL Formatters**: Beautify, minify, and validate structured data.
* **JSON to TypeScript**: Instantly generate TypeScript interfaces from JSON payloads.
* **CSS Helpers**: Box Shadow Generator, Gradient Generator, and Palette Creator.
* **Diagnostics**: Environment Validator, Website Status Checker, and Cron Humanizer.
* **Security & Testing**: Password Generator, GUID/UUID Generator, Regex Tester, MD5/SHA Hash Generator.

### ✍️ Text & Writing Productivity
* **Formatting**: Case Converter, Clean Text Online, Find and Replace, Split Text.
* **Cleanup**: Remove Duplicate Lines, Remove Emojis, Remove Extra Spaces, Remove Punctuation.
* **Metrics**: Word Counter, Line Counter, Text Pixel Width Calculator.
* **Social**: Social Media Text Stylizer, Thread-to-Post formatting.

### 🎲 Interactive & Fun Tools
* **Generators**: Godly Name Generator, Dummy Data Generator.
* **Widgets**: Spin the Wheel Decider, Dice Roller, Flip a Coin, Online Tally Counter, Morse Code Translator.

---

## 🛠️ Tech Stack

Toollix is designed to be self-hosted, scalable, and highly performant:

* **Frontend & Backend**: Next.js 16.2.2 (App Router with Turbopack)
* **Styling**: TailwindCSS & Vanilla CSS
* **Database**: MongoDB (via Mongoose)
* **Caching & Limits**: Upstash Redis (Sliding window rate limiting)
* **Authentication**: NextAuth.js / Auth.js (supporting Google and credential sign-ins)
* **Monitoring**: Sentry (Error tracking)
* **Analytics**: PostHog & Google Analytics
* **Storage**: Google Cloud Storage (GCS) (optional backup storage)

---

## 🏁 Installation & Local Setup

Get your local instance of Toollix running in minutes.

### 1. Prerequisites
Before starting, make sure you have:
* **Node.js** 20.x or later
* **MongoDB** instance (local server or MongoDB Atlas)
* **Redis** (local instance or Upstash)

### 2. Clone the Repository
```bash
git clone https://github.com/Breaker97/Toollix-public.git
cd Toollix-public
```

### 3. Configure Environment Variables
Copy the template configuration file:
```bash
cp .env.example .env.local
```
Open `.env.local` in your editor and fill in your connection strings and secret tokens (see [Environment Variables](#-environment-variables) below for details).

### 4. Install Dependencies
```bash
npm install
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see Toollix in action.

---

## 🔑 Environment Variables

Toollix uses the following environment variables:

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/toollix` | **Yes** |
| `NEXTAUTH_SECRET` | Secret key for JWT sessions | `your_nextauth_secret` | **Yes** |
| `AUTH_SECRET` | NextAuth.js auth secret | `your_auth_secret` | **Yes** |
| `NEXTAUTH_URL` | Application root URL | `http://localhost:3000` | **Yes** |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `your_google_client_id` | No (Google Auth) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `your_google_client_secret` | No (Google Auth) |
| `UPSTASH_REDIS_REST_URL` | Redis URL for rate limiting | `your_upstash_redis_rest_url` | No (Rate Limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Redis token for rate limiting | `your_upstash_redis_rest_token` | No (Rate Limiting) |
| `GCS_BUCKET_NAME` | Google Cloud Storage Bucket | `your_gcs_bucket_name` | No (Cloud Storage) |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | PostHog token for analytics | `your_posthog_token` | No (Analytics) |
| `SMTP_HOST` | Host for outgoing mail servers | `smtp.gmail.com` | No (Email) |
| `SMTP_PORT` | Port for outgoing mail servers | `587` | No (Email) |
| `SMTP_USER` | Email username | `your_smtp_username` | No (Email) |
| `SMTP_PASS` | Email password | `your_smtp_password` | No (Email) |

---

## 🌐 Deployment Guide

### Deploying on Vercel
Toollix is fully optimized for deployment on Vercel:

1. Click the **Deploy** button or connect your GitHub repository directly to Vercel.
2. In the Vercel project configuration, add all required variables under **Environment Variables**.
3. Choose the Next.js framework preset.
4. Click **Deploy**. Vercel will automatically build and serve the application globally.

---

## 🗺️ Roadmap

We are constantly adding new features and improving the developer experience. Here is what is planned:

* [ ] **Cryptographic Audit Trails**: Adding secure verification chains to PDF signatures.
* [ ] **Offline Mode (PWA)**: Allow offline usage of local tools like text formatters and calculators.
* [ ] **Self-Hosting Docker Image**: Easy one-line Docker installation.
* [ ] **Extension Marketplace**: Let developers publish custom tools into the dashboard.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---

## 💖 Sponsors

Toollix is free software supported by our sponsors. If you or your company would like to support the maintenance of this repository, please consider sponsoring us.

---

## ❤️ Hosting Partner

This project is proudly hosted by **VPSDime**.

If you're looking for reliable VPS hosting, please consider VPSDime.

[https://vpsdime.com/a/4765/linux-vps](https://vpsdime.com/a/4765/linux-vps)

---

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by the Toollix Team.
