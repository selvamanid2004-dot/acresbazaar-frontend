# AcresBazaar Real Estate Platform - Frontend Suite 🏡

Comprehensive frontend client suite for **AcresBazaar**, consisting of:
1. **Public Web Portal**: High-performance consumer-facing application built with **Angular 19**.
2. **Executive Admin Dashboard**: Real-time management portal built with **React 18** and **Vite** located in `admin-panel/`.

---

## 🌟 Modules & Features

### 1. Public Web Portal (`/`)
- **Framework**: Angular 19 (Standalone Components, Signals, RxJS)
- **Features**:
  - Interactive Property Search & Filter (Villas, Plots, Apartments, Commercial)
  - Interactive Maps & Location Search
  - Spotter / Snap Property Program (Upload & Earn Rewards)
  - Dealer & Buyer Property Booking Workflows
  - Real-Time AI Support Assistant & Live Chat
  - Membership Subscription Plans (Gold & Platinum tiers)
  - Verified Partner Network Directory

### 2. Executive Admin Dashboard (`/admin-panel`)
- **Framework**: React 18 + Vite + TypeScript + Lucide Icons
- **Features**:
  - Live Operational KPI Dashboard & Real-Time Stats
  - Property Listing Management (Approval, Verification, Moderation, Plan assignment)
  - Customer & User Management (Role assignment, Active/Inactive status toggle)
  - Booking Management & Status Tracking
  - Spotter Rewards Approval & Payout Management
  - CMS Content & Website Settings Manager
  - Executive Calendar & Inspection Schedules
  - Data Export Engine (CSV & PDF)

---

## 🛠️ Prerequisites

- **Node.js**: `v18.x` or `v20.x`+
- **npm**: `v9.x`+

---

## ⚡ Quick Start

### 1. Running the Public Angular Portal (Port 4200)
```bash
# In the root frontend directory:
npm install
npm start
```
Public Portal will be live at: **`http://localhost:4200`**

### 2. Running the React Admin Panel (Port 5173)
```bash
# In the admin-panel directory:
cd admin-panel
npm install
npm run dev
```
Admin Dashboard will be live at: **`http://localhost:5173`**

---

## 📦 Production Builds

```bash
# Build Angular Public Portal
npm run build

# Build React Admin Panel
cd admin-panel
npm run build
```

---

## 🔑 Environment Configuration

### Public Website (.env)
```env
API_BASE_URL="http://localhost:5001/api"
```

### Admin Panel (admin-panel/.env)
```env
VITE_API_URL="http://localhost:5001/api"
```

---

## 📄 License
Private & Confidential — AcresBazaar Platform.
