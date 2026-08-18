# 🇨🇦 Studio Books — Founder & Engineering Onboarding Guide

> **Practice-First Multi-Client Bookkeeping & Accounting Platform for Canadian CPAs**  
> *Immutable Double-Entry Ledger • CRA & Revenu Québec Compliance • AI OCR Ingestion • Multi-Client Practice Hub*

---

## 📌 Executive Summary

**Studio Books** is built specifically to solve the biggest pain points Canadian bookkeeping firms face when managing multiple business clients on generic US-centric platforms:

1. **Quebec Dual Sales Tax Compliance**: Native calculation of federal **GST (5%)** and provincial **QST (9.975%)**, alongside harmonized **HST (13% ON)**, with auto-populated CRA Line 105/108 & RQ Line 205/208 worksheets.
2. **Fiduciary Trust Accounting**: Built-in 4-digit Canadian charts of accounts distinguishing **Operating Chequing (`1010`)** from **Retainer Trust Accounts (`1020`)** with zero trust overdraft protection.
3. **Immutable CRA & SOC-2 Audit Trail**: Strict double-entry invariance (`SUM(Debits) === SUM(Credits)`) in atomic transactions. Erroneous postings are corrected through auditable reversing entries (`createReversalJournalEntry`).
4. **Multimodal AI OCR Ingestion**: Drag-and-drop receipt & invoice scanning with **Gemini 2.5 Flash** vision to extract line items, taxes, and auto-suggest General Ledger codes.
5. **One-Click CPA Financial Statements**: Publication-ready PDF and Excel export for **Profit & Loss (P&L)**, **Balance Sheet**, **Trial Balance**, and **GL Audit Trail** with firm letterheads and signature blocks.

---

## 🏗️ Technical Architecture & Stack

```
                                  STUDIO BOOKS ARCHITECTURE
                                  
     ┌────────────────────────────────────────────────────────────────────────┐
     │                      Frontend Layer (React 19 + Vite)                  │
     │   • React Context (Optimistic Live Sync)   • Tailwind CSS Design System│
     │   • Publication PDF Exporter Engine        • Interactive Swagger UI    │
     └───────────────────────────────────┬────────────────────────────────────┘
                                         │ REST API (/api/v1/*)
                                         ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │                      Backend Layer (Express + TypeScript)              │
     │   • LedgerService (Double-Entry Balance Rule: Debits === Credits)      │
     │   • TaxService (Canadian CRA & RQ Rate Calculator)                     │
     │   • OCRService (Gemini 2.5 Flash Multimodal Vision Engine)             │
     │   • BankService & ReceiptService (Reconciliation Workflows)            │
     └───────────────────────────────────┬────────────────────────────────────┘
                                         │ Prisma ORM Client
                                         ▼
     ┌────────────────────────────────────────────────────────────────────────┐
     │                      Database Layer (SQLite / PostgreSQL)              │
     │   • 9 Relational Models: Firm, User, ClientBusiness, ChartOfAccount,   │
     │     JournalEntry, LedgerLine, BankTransaction, Receipt, AuditLog       │
     └────────────────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons | Responsive multi-client practice interface |
| **Backend API** | Node.js, Express, TypeScript, `cors`, `dotenv` | Multi-tenant RESTful services with header isolation |
| **Database & ORM** | Prisma ORM, SQLite (`dev.db`) / PostgreSQL ready | Type-safe schema migrations & relation queries |
| **AI Multimodal Vision** | Google Gemini 2.5 Flash (`@google/genai`) | Automated receipt & invoice OCR parsing |
| **API Documentation** | OpenAPI 3.0, Swagger UI (`/api/docs`) | Interactive endpoint explorer & developer testing |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone git@github.com:Ben-ayesu/account_demo.git
cd account_demo
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Contents of `.env`:
```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
GEMINI_API_KEY="your-free-gemini-api-key-here"  # Optional: enables live multimodal AI vision
```

### 3. Initialize & Seed Database
Hydrate 1 practice firm, 4 users, 12 Canadian clients, 240 chart of accounts, 48 journal entries, 60 bank transactions, and 36 receipts:
```bash
npx prisma db push
npm run db:seed
```

### 4. Start the Server
```bash
npm run server
```
Open **`http://localhost:3000`** in your browser!

---

## 🌐 Key URLs & Demo Endpoints

| Resource | URL | Description |
| :--- | :--- | :--- |
| **Web Application** | `http://localhost:3000` | Full Studio Books bookkeeping app |
| **Swagger Interactive Docs** | `http://localhost:3000/api/docs` | Test all REST endpoints with live payload execution |
| **Raw OpenAPI Spec** | `http://localhost:3000/api/docs/swagger.json` | Importable JSON spec for Postman |
| **Visual Database Studio** | `http://localhost:5555` (via `npm run db:studio`) | Visual table browser and data editor |

---

## 🎬 3-Minute Interactive Demo Script for Co-Founders

Follow this sequence to showcase the full power of Studio Books in 3 minutes:

### Step 1: Practice Multi-Client Hub (`/firm-overview`)
1. Open `http://localhost:3000`.
2. Notice the practice overview displaying **12 Canadian clients** (Boucherie Plateau, Mile End Coffee, Apex Nordic, etc.) with real-time pending reconciliation counts and tax filing statuses.
3. Click on **Boucherie Plateau Inc. (QC)** to enter their client ledger.

### Step 2: Double-Entry General Ledger (`/general-ledger`)
1. Click **"New Journal Entry"** in the top navigation.
2. Enter a memo: `"Bell Commercial Fiber"` and attempt to post an imbalanced entry (e.g. Debit $100, Credit $90) — watch the mathematical balance validator prevent invalid posting.
3. Post a balanced entry and click **"Reverse Entry"** on any posted row — demonstrate how it creates a CRA-compliant immutable reversal entry (`[REVERSAL OF #...]`) without mutating historic records.

### Step 3: Bank Feed Reconciliation (`/bank-reconciliation`)
1. View the live bank statement feed with confidence score matching hints.
2. Click **"Reconcile"** on a transaction — notice how it automatically pairs with the General Ledger and calculates the Canadian tax split.

### Step 4: AI OCR Receipt Scanner (`/receipts-ocr`)
1. Click **"Simulate Receipt Upload"**.
2. Select any quick preset (e.g. *Hydro-Québec* or *Costco Wholesale*) or drop a receipt image.
3. Watch the system extract the vendor, date, subtotal, and tax amounts.
4. Click **"Post to Ledger"** to book the invoice as an Accounts Payable transaction with 1 click!

### Step 5: One-Click Financial Statement Export (`/financial-reports`)
1. Click the **Financial Reports** tab.
2. Switch between **Profit & Loss**, **Balance Sheet**, **Trial Balance**, and **GL Audit Trail**.
3. Click **"Export PDF / Print"** to preview the publication-ready statement with practice branding and CPA review sign-off block.
4. Click **"Export Excel (CSV)"** to demonstrate formatted spreadsheet download.

---

## ☁️ Cloud Deployment Guide (Sharing with Co-Founders)

You can deploy Studio Books in 5 minutes to give your co-founders a live public link:

### Option A: Deploy on Railway (Recommended)
1. Go to [railway.app](https://railway.app) $\rightarrow$ **New Project** $\rightarrow$ **Deploy from GitHub repo**.
2. Select `Ben-ayesu/account_demo`.
3. Add Environment Variables:
   - `PORT`: `3000`
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: `file:./dev.db` (or attach a Railway PostgreSQL database and set `DATABASE_URL`)
   - `GEMINI_API_KEY`: *(Your Google AI Studio API key)*
4. Build Command: `npm install && npx prisma db push && npm run db:seed && npm run build`
5. Start Command: `npm run server`

### Option B: Deploy on Render
1. Go to [render.com](https://render.com) $\rightarrow$ **New Web Service** $\rightarrow$ Connect `Ben-ayesu/account_demo`.
2. Build Command: `npm install && npx prisma db push && npm run db:seed && npm run build`
3. Start Command: `node server.ts` or `npm run server`
4. Set Environment Variables in the Render dashboard.

---

## 👥 Practice User Roles & Seeded Credentials

| User Name | Role | Email | Permissions |
| :--- | :--- | :--- | :--- |
| **Ben Ayesu-Attah** | Frontend & UX Lead | `ben@studiobooks.io` | Full Firm Owner Access |
| **Jeff** | Backend & Ledger Architect | `jeff@studiobooks.io` | Full Firm Admin Access |
| **Johnson** | Domain & Product Lead | `johnson@studiobooks.io` | Full Firm Admin Access |
| **Sarah Tremblay, CPA** | Senior Staff Auditor | `sarah.t@studiobooks.io` | Audit Review & Ledger Posting |

---

## 📄 License & Confidentiality
*Studio Books is proprietary and confidential. Copyright © 2026 Studio Bookkeeping & Associates Inc. All rights reserved.*
