# 🛍️ SHOPEZ — Full-Stack Production E-Commerce Application

SHOPEZ is an enterprise-grade, modern, and responsive full-stack MERN (MongoDB, Express.js, React.js, Node.js) e-commerce web platform engineered for high-performance shopping experiences, robust inventory management, secure authentication, and administrative controls.

---

## 🌟 Key Application Features

### 👤 Customer-Facing Experience
- **Secure Authentication**: Encrypted password storage via `bcryptjs` and session issuance using secure HTTP-only cookies (`JWT`).
- **Interactive Homepage**: Dynamic hero promotional banners with carousel, department highlights, seasonal sales, trending collections, and trust badges.
- **Product Catalog & Filters**:
  - Full-text search by title and description.
  - Multi-faceted filtering: Department categories, gender, price range sliders, minimum discount percentage, and sizes.
  - Multi-criteria sorting: Newest, Price (Low-to-High / High-to-Low), Popularity, and Discount depth.
  - Responsive paginated grid layout.
- **Product Details**:
  - High-resolution multi-angle image gallery with interactive thumbnail selector.
  - Dynamic size chip selector with required validation.
  - Live inventory indicators ("In Stock", "Only X left", "Out of Stock").
  - Quantity increment/decrement selector.
  - Quick "Add to Bag" and instant "Buy Now" flow.
  - Wishlist toggle and category-based related products recommendations.
- **Shopping Cart**:
  - Server-synchronized cart backed by MongoDB for authenticated users.
  - Seamless guest cart persistence in `localStorage` with automatic server-side merge upon login.
  - Strict server-side price and stock re-validation (prevents client price tampering).
- **Checkout & Order Placement**:
  - Shipping address selection and multi-field validation.
  - Cash on Delivery (COD) and Online Payment (Test Gateway) support.
  - Real-time price breakdown: Original subtotal, discount savings, shipping rules (Free over $50), sales tax (5%), and final payable amount.
- **Order Management & Tracking**:
  - Order success receipt with server-loaded snapshots.
  - Interactive visual milestone tracking timeline (`Pending` ➔ `Confirmed` ➔ `Processing` ➔ `Shipped` ➔ `Out for Delivery` ➔ `Delivered`).
  - Carrier tracking number integration.
  - Cancellation workflow with automated stock restoration for eligible orders (`Pending` / `Confirmed`).
  - Return request processing for delivered orders.
- **User Profile**:
  - Personal information management and saved shipping destinations.
  - Secure password update requiring verification of existing credentials.
  - Persistent wishlist management.

### 🛡️ Administrative Console (`/admin`)
- **Executive Analytics Dashboard**:
  - Real-time KPI summary: Total Revenue, Orders count, Product catalog depth, Registered customer count, and Pending fulfillment queue.
  - Interactive **Recharts** visualizations: Monthly gross sales trajectory and category distribution bar chart.
  - Quick view of recent inbound orders and top-performing merchandise.
- **Merchandise & Inventory Management**:
  - Searchable catalog data table with real-time stock levels, pricing, discounts, and active visibility toggles.
  - Multi-attribute modal: Title, description, main image, multiple gallery images, category assignment, sizes, gender target, base price, discount %, and inventory counts.
  - File upload engine with Multer, MIME validation, and file-size guardrails.
  - Safe deletion and live editing.
- **Category Management**:
  - Department organization with custom slugs and image cards.
  - Safe deletion logic: Prevents deleting categories that contain active products.
- **Hero Banner Management**:
  - Promotional carousel management, custom headings, badge labels, route redirection links, and active toggles.
- **Order Fulfillment & Logistics**:
  - Global orders table with customer lookups, order status filtering, and total values.
  - Status transition controls (`Pending`, `Confirmed`, `Processing`, `Shipped`, `Out for Delivery`, `Delivered`, `Cancelled`, `Returned`).
  - Real-time carrier tracking number updates.
- **Customer Account Management**:
  - Customer directory with search and active status toggle controls.

---

## 🏗️ Architecture & Technology Stack

```
shopez/
├── client/                     # Vite + React 18 Frontend
│   ├── src/
│   │   ├── components/         # Common, layout, products, cart, admin components
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── pages/              # Customer & Admin pages
│   │   ├── services/           # Axios client with interceptors (/api proxy)
│   │   ├── App.jsx             # React Router routing hierarchy & toast provider
│   │   └── main.jsx
│   ├── vite.config.js          # Reverse proxy configuration
│   └── tailwind.config.js      # Custom theme styling
│
├── server/                     # Express.js REST API Backend
│   ├── config/db.js            # Live MongoDB + In-Memory fallback connection
│   ├── controllers/            # Auth, Product, Category, Banner, Cart, Order, Admin
│   ├── middleware/             # Auth JWT, Admin Guard, Multer, Rate Limiter, Error Handler
│   ├── models/                 # Mongoose schemas: User, Product, Category, Banner, Cart, Order, Wishlist
│   ├── routes/                 # REST endpoints
│   ├── utils/                  # Price calculations & unique order number generation
│   ├── scripts/                # Database seed script & automated test suite
│   ├── uploads/                # Managed local media assets
│   ├── app.js                  # Express middleware & route bindings
│   └── server.js               # Server initialization
│
├── package.json                # Project orchestrator
└── README.md
```

### Stack Details
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons, Recharts, React Hot Toast, Axios, React Router DOM v6.
- **Backend**: Node.js, Express.js, MongoDB / Mongoose ODM, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `helmet`, `cors`, `express-rate-limit`, `multer`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or newer)
- **npm** (v9 or newer)
- **MongoDB** running locally on port 27017 or a MongoDB Atlas connection string in `server/.env`.

### 2. Installation
Install dependencies for both backend and frontend:
```bash
# Navigate to the project directory
cd shopez

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Database Seeding
Seed the database with default departments, promotional hero banners, high-resolution product catalog, admin credentials, and test customer accounts:
```bash
cd server
npm run seed
```

### 4. Running the Application
Open two terminal windows:

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

Navigate to **`http://localhost:5173`** in your browser.

---

## 🔑 Default Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@shopez.com` | `Admin@shopez2026` | Full Admin Console (`/admin`) + Public Store |
| **Customer** | `alex@example.com` | `User@shopez2026` | Public Store, Bag, Checkout, Order Tracking |

*(Convenient demo buttons are also present on the Login page to pre-fill credentials instantly!)*

---

## 🧪 Automated Integration Tests

SHOPEZ includes an automated integration test runner verifying all 13 core subsystems (health checks, authentication, product filters, cart recalculations, order placement, admin metrics, and status transitions):

```bash
cd server
node scripts/runTests.js
```

All 13 integration tests run in an isolated suite and pass with 0 errors.

---

## 🔒 Security Implementations
1. **HTTP-only Cookies**: Protects JWT session tokens from Cross-Site Scripting (XSS).
2. **Password Salting & Hashing**: Utilizes `bcryptjs` with salt work factor of 10. Passwords are never returned in JSON serialization (`toJSON` override).
3. **Role-Based Access Control (RBAC)**: Strict `protect` and `requireAdmin` middleware guards on all state-changing endpoints.
4. **Server-Side Trust Model**: Cart prices and discounts are recomputed from database models during order creation; frontend client prices are never trusted.
5. **Inventory Safety**: MongoDB transactions and automated inventory decrements on order confirmation, plus automatic restoration when orders are cancelled.
6. **Input Sanitization & Headers**: `helmet` security headers, strict CORS origin controls, and sensitive endpoint rate limiting (`express-rate-limit`).
