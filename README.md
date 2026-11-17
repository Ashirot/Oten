# Pastil Rice Davao — Database Systems 1 Final Project

> **Project Title:** Design and Development of a Database-Driven Information System  
> **Course:** Database Systems 1 (Topic 2: Inventory and Sales Management System)  
> **Architecture:** Decoupled Full-Stack Architecture  
> - **Backend:** Laravel 11/12 REST API (`/backend`)  
> - **Frontend:** ReactJS 19 with Tailwind CSS 4 (`/frontend`)  
> - **Database:** MySQL 8.0 InnoDB Engine  
> - **Documentation:** Academic Deliverables (`/docs`)  

---

## 📁 Repository Folder Structure

```text
Project/
├── backend/                  # Laravel REST API Application (PHP 8.4)
│   ├── app/                  # Controllers, Models, Middleware
│   ├── config/               # Database, CORS, Sanctum configuration
│   ├── database/             # Migrations, Seeders, Raw SQL scripts
│   │   ├── migrations/       # Schema, Check Constraints, Routines & Triggers
│   │   ├── seeders/          # DatabaseSeeder with realistic master data
│   │   └── sql/              # 5 Pure SQL deliverables (.sql)
│   ├── routes/               # api.php (40 REST endpoints)
│   ├── .env                  # MySQL connection settings
│   └── artisan               # Artisan CLI
│
├── frontend/                 # Standalone ReactJS 19 Application
│   ├── src/
│   │   ├── components/       # Storefront, Modals, Admin Dashboard, DB Lab
│   │   ├── services/         # api.js API client
│   │   ├── App.jsx           # Main App component
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Tailwind CSS 4 configuration
│   ├── index.html            # HTML shell with Leaflet GPS mapping & Poppins font
│   ├── package.json          # Vite, React 19, Tailwind CSS 4, Lucide Icons
│   └── vite.config.js        # Vite dev server with /api proxy to backend
│
├── docs/                     # 13 Final Project Academic Deliverables
│   ├── 01_PROJECT_PROPOSAL.md
│   ├── 02_DATABASE_DESIGN_AND_ERD.md
│   ├── 03_SQL_IMPLEMENTATION_AND_ROUTINES.md
│   ├── 04_QUERY_OPTIMIZATION_AND_TRANSACTIONS.md
│   ├── 05_ADDITIONAL_DATABASE_CONCEPTS.md
│   ├── 06_TESTING_RESULTS_AND_TEST_MATRIX.md
│   ├── 07_USER_GUIDE.md
│   ├── 08_PRESENTATION_SLIDES_OUTLINE.md
│   ├── 09_LIVE_DEMO_SCRIPT.md
│   └── FINAL_PROJECT_DOCUMENTATION.md
│
└── legacy_static/            # Original static HTML/JS/CSS files (archived)
```

---

## 🚀 How to Run the Application

### 1. Start Backend (Laravel REST API)
```bash
cd backend

# Setup database (if first time)
php artisan migrate:fresh --seed

# Start backend server
php artisan serve
```
Backend runs at: **http://127.0.0.1:8000**

### 2. Start Frontend (ReactJS + Tailwind CSS)
In a new terminal window:
```bash
cd frontend

# Install dependencies (if first time)
npm install

# Start Vite dev server
npm run dev
```
Frontend runs at: **http://127.0.0.1:5173**

---

## 🔑 1-Click Evaluation Accounts
In the frontend navbar, click **Sign In** and use the 1-click evaluation buttons:
- **👑 Admin:** `admin@pastildavao.com` / `admin123` (Full catalog, stored procedure restocking, business reports, database laboratory)
- **💼 Staff:** `staff@pastildavao.com` / `staff123` (Order fulfillment stage updates, catalog inspection)
- **🛒 Customer:** `maria@example.com` / `password123` (Menu ordering, checkout with Davao City GPS delivery map, review submission)

---

## 📋 Academic Deliverables Checklist (13/13 Completed)

1. [x] **Project Proposal:** [docs/01_PROJECT_PROPOSAL.md](docs/01_PROJECT_PROPOSAL.md)
2. [x] **Complete Documentation:** [docs/FINAL_PROJECT_DOCUMENTATION.md](docs/FINAL_PROJECT_DOCUMENTATION.md)
3. [x] **ERD & Relational Schema:** [docs/02_DATABASE_DESIGN_AND_ERD.md](docs/02_DATABASE_DESIGN_AND_ERD.md)
4. [x] **3NF Normalization Proof:** [docs/02_DATABASE_DESIGN_AND_ERD.md](docs/02_DATABASE_DESIGN_AND_ERD.md#4-normalization-analysis-unf-to-3nf)
5. [x] **Data Dictionary:** [docs/02_DATABASE_DESIGN_AND_ERD.md](docs/02_DATABASE_DESIGN_AND_ERD.md#5-data-dictionary)
6. [x] **DDL Schema & Seed Data:** [backend/database/sql/01_schema_and_seed.sql](backend/database/sql/01_schema_and_seed.sql)
7. [x] **Stored Routines, Triggers & Queries:** [backend/database/sql/02_procedures_functions_triggers.sql](backend/database/sql/02_procedures_functions_triggers.sql) & [03_complex_queries_and_set_operations.sql](backend/database/sql/03_complex_queries_and_set_operations.sql)
8. [x] **Working Source Code:** [backend/](backend/) and [frontend/](frontend/)
9. [x] **Query Optimization Evidence (EXPLAIN):** [backend/database/sql/04_query_optimization.sql](backend/database/sql/04_query_optimization.sql) & [docs/04_QUERY_OPTIMIZATION_AND_TRANSACTIONS.md](docs/04_QUERY_OPTIMIZATION_AND_TRANSACTIONS.md)
10. [x] **Testing Matrix (18/18 Passed):** [docs/06_TESTING_RESULTS_AND_TEST_MATRIX.md](docs/06_TESTING_RESULTS_AND_TEST_MATRIX.md)
11. [x] **User Operating Manual:** [docs/07_USER_GUIDE.md](docs/07_USER_GUIDE.md)
12. [x] **Presentation Defense Slides:** [docs/08_PRESENTATION_SLIDES_OUTLINE.md](docs/08_PRESENTATION_SLIDES_OUTLINE.md)
13. [x] **Live Demonstration Video Script:** [docs/09_LIVE_DEMO_SCRIPT.md](docs/09_LIVE_DEMO_SCRIPT.md)
