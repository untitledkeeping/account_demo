# 🇨🇦 Studio Books

**Practice-First Multi-Client Bookkeeping & Accounting Platform for Canadian CPAs**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://reactjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748.svg)](https://www.prisma.io/)
[![Express](https://img.shields.io/badge/Express-4.21-green.svg)](https://expressjs.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D.svg)](https://swagger.io/)

---

## 📖 Table of Contents
- [Executive Overview](#-executive-overview)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Founder & Onboarding Guide](#-founder--onboarding-guide)

---

## 📌 Executive Overview

**Studio Books** is a modern, practice-first bookkeeping platform tailored specifically for the Canadian regulatory and tax landscape. It provides Canadian accounting firms with unified multi-client workload management, immutable double-entry ledger bookkeeping, dual federal/provincial tax reporting (GST/HST/QST), multimodal AI receipt parsing, and publication-ready financial statements.

---

## ✨ Key Features

- **🇨🇦 Canadian Dual Sales Tax Engine**: Full calculation and compliance for Quebec (GST 5% + QST 9.975%), Ontario (HST 13%), and other provinces, with auto-populated CRA Line 105/108 & RQ Line 205/208 reporting.
- **⚖️ Immutable Double-Entry Ledger**: Mathematical balance enforcement (`SUM(Debits) === SUM(Credits)`) in atomic transactions with audit-trail reversing entries.
- **🏦 Fiduciary Trust & Operating Accounts**: Standard Canadian 4-digit GL accounts distinguishing Operating Chequing (`1010`) from Retainer Trust (`1020`) accounts.
- **🤖 Multimodal AI Receipt OCR**: Drag-and-drop document ingestion powered by **Gemini 2.5 Flash** vision with automatic tax splitting and 1-click ledger posting.
- **📊 One-Click Financial Statement Export**: Publication-ready PDF and Excel export for Profit & Loss (P&L), Balance Sheet, Trial Balance, and GL Audit Trail.
- **📑 Interactive Swagger UI**: Full OpenAPI 3.0 interactive documentation hosted at `/api/docs`.

---

## 🏗️ Architecture & Tech Stack

```
Frontend (React 19 + Vite + Tailwind CSS)
   │
   ├── REST API calls (/api/v1/*)
   ▼
Backend Server (Express + TypeScript)
   ├── LedgerService (Double-entry balance enforcement & reversals)
   ├── TaxService (Canadian CRA & Revenu Québec tax engine)
   ├── OCRService (Gemini 2.5 Flash multimodal receipt vision)
   └── BankService & ReceiptService (Reconciliation workflows)
   │
   ├── Prisma ORM Client
   ▼
Database (SQLite dev.db / Cloud PostgreSQL ready)
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Initialize & Seed Database
```bash
npx prisma db push
npm run db:seed
```

### 4. Run Server & Application
```bash
npm run server
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## 📚 API Documentation

Once the server is running, explore the interactive Swagger documentation:
- **Interactive Swagger UI**: `http://localhost:3000/api/docs`
- **Raw OpenAPI 3.0 JSON Spec**: `http://localhost:3000/api/docs/swagger.json`
- **Prisma Studio Visual DB**: `npx prisma studio` (available on `http://localhost:5555`)

---

## 👥 Founder & Engineering Documentation

For a detailed 3-minute investor demo script, technical blueprint, and cloud deployment guides, see the [Founder Onboarding Guide](FOUNDER_ONBOARDING_GUIDE.md).
