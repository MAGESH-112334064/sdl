# Canteen Connect - Application Architecture

## 📱 Project Overview
**Canteen Connect** is a full-stack web application for managing a canteen/cafeteria ordering system. It's a React-based SPA with authentication and admin management features.

---

## 🎨 FRONTEND ARCHITECTURE

### Frontend Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.3.1 (fast build and HMR)
- **Package Manager**: Bun
- **Dev Server Port**: 8080
- **Build Output**: dist/ folder (optimized for production)

### Key Frontend Libraries
| Library | Version | Purpose |
|---------|---------|---------|
| React Router DOM | 6.30.1 | Client-side routing (SPA navigation) |
| React Hook Form | 7.61.1 | Form state management |
| TanStack React Query | 5.83.0 | Server state management (data fetching) |
| Zod | 3.25.76 | Runtime schema validation |
| Tailwind CSS | 3.4.17 | Utility-first styling |
| Shadcn/UI | (Radix UI) | Pre-built accessible components |
| Recharts | 2.15.4 | Charts & analytics visualization |
| Framer Motion | 12.34.0 | Animations |
| Sonner | 1.7.4 | Toast notifications |

### Frontend Project Structure
```
src/
├── App.tsx                    # Main app with routing setup
├── main.tsx                   # React entry point
├── App.css                    # Global styles
├── index.css                  # Base CSS
├── vite-env.d.ts             # Vite environment types
│
├── pages/                     # Page components
│   ├── Auth.tsx              # Login/signup page
│   ├── AuthCallback.tsx       # OAuth callback handler
│   ├── Index.tsx             # Home/landing page
│   ├── Menu.tsx              # Browse menu items
│   ├── ItemDetail.tsx        # Product details view
│   ├── Cart.tsx              # Shopping cart
│   ├── Checkout.tsx          # Payment & order placement
│   ├── OrderSuccess.tsx      # Order confirmation
│   ├── OrderTracking.tsx     # Track order status
│   ├── Orders.tsx            # User order history
│   ├── Profile.tsx           # User profile management
│   ├── NotFound.tsx          # 404 page
│   │
│   └── admin/                # Admin-only pages
│       ├── AdminDashboard.tsx        # Analytics & overview
│       ├── AdminOrders.tsx           # Manage orders
│       ├── AdminProducts.tsx         # Create/edit products
│       ├── AdminCategories.tsx       # Manage categories
│       └── AdminSettings.tsx         # System settings
│
├── components/               # Reusable components
│   ├── NavLink.tsx           # Navigation link component
│   │
│   ├── auth/                 # Authentication components
│   │   ├── ProtectedRoute.tsx        # Guard for user routes
│   │   └── AdminRoute.tsx            # Guard for admin routes
│   │
│   ├── layout/               # Layout components
│   │   ├── AppLayout.tsx             # Main app layout wrapper
│   │   └── BottomNav.tsx             # Mobile bottom navigation
│   │
│   ├── shared/               # Shared business components
│   │   ├── ProductCard.tsx           # Item card display
│   │   ├── StatusBadge.tsx           # Order status badge
│   │   └── VegBadge.tsx              # Veg/non-veg indicator
│   │
│   └── ui/                   # Shadcn/UI components (30+ components)
│       ├── button.tsx, input.tsx, card.tsx, etc.
│       └── use-toast.ts, toast.tsx, toaster.tsx
│
├── contexts/                 # React Context (state management)
│   └── AuthContext.tsx       # Authentication context with Supabase
│
├── hooks/                    # Custom React hooks
│   ├── useCart.tsx           # Cart state management
│   ├── use-toast.ts          # Toast notification hook
│   └── use-mobile.tsx        # Mobile breakpoint detection
│
├── integrations/             # External service integrations
│   ├── lovable/              # Lovable AI integration
│   │   └── index.ts
│   └── supabase/             # Supabase integration
│       ├── client.ts         # Supabase client setup
│       └── types.ts          # TypeScript types from DB schema
│
└── lib/                      # Utilities
    └── utils.ts              # Helper functions (e.g., cn for className)
```

### Frontend Routes
```
/                    → Home page (AppLayout)
/menu                → Menu listing
/item/:id            → Product details
/cart                → Shopping cart
/checkout            → Checkout (Protected)
/order-success/:id   → Order confirmation (Protected)
/order-tracking/:id  → Track order (Protected)
/orders              → Order history (Protected)
/profile             → User profile (Protected)
/auth                → Login/Signup page
/auth/callback       → OAuth callback (Lovable Auth)
/admin               → Admin dashboard (Admin only)
/admin/orders        → Manage orders (Admin only)
/admin/products      → Manage products (Admin only)
/admin/categories    → Manage categories (Admin only)
/admin/settings      → Settings (Admin only)
```

### Frontend Development
```bash
# Start dev server (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
npm run test:watch

# Lint code
npm run lint
```

---

## 🔧 BACKEND ARCHITECTURE

### Backend Technology Stack
- **Backend**: Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL 14.1 (hosted in Supabase)
- **Authentication**: Supabase Auth (Magic Link, OAuth providers)
- **Real-time**: Supabase Realtime (WebSocket subscriptions)
- **API**: REST API (auto-generated from PostgreSQL schema)
- **Project ID**: `amfrvvtfvxgsbfkntict`

### Backend Services Provided by Supabase
1. **Authentication Service**
   - User registration & login
   - Magic link authentication
   - OAuth providers (Google, GitHub, etc.)
   - Session management

2. **Database Service**
   - PostgreSQL relational database
   - Row-level security (RLS) policies
   - Real-time subscriptions
   - Automatic REST API generation

3. **Storage Service**
   - File storage for product images
   - User profile pictures

4. **Edge Functions** (Optional)
   - Server-side logic execution
   - Webhook handling

### Backend Integration (Supabase Client)
```typescript
// src/integrations/supabase/client.ts

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

### API Communication Pattern
- **Frontend** → **Supabase REST API** → **PostgreSQL Database**
- Libraries: `@supabase/supabase-js` (client-side)
- TanStack React Query for server state caching
- Real-time updates via Supabase Realtime

### Authentication Flow
1. User visits `/auth` → login form
2. User authenticates via Supabase (Magic Link/OAuth)
3. OAuth redirects to `/auth/callback`
4. Session stored in `localStorage` (auto-refresh enabled)
5. `AuthContext` manages session state globally
6. Protected routes check `useAuth()` hook

---

## 💾 DATABASE ARCHITECTURE

### Database Location & Hosting
- **Provider**: Supabase Cloud (PostgreSQL 14.1)
- **Project ID**: `amfrvvtfvxgsbfkntict`
- **Hosted on**: Supabase infrastructure (managed service)
- **Config File**: `supabase/config.toml` (local development config)

### Database Tables & Schema

#### 1. **profiles** (User Profiles)
```typescript
{
  user_id: UUID (PK, FK to auth.users)
  email: string | null
  phone: string | null
  name: string | null
  updated_at: timestamp
}
```
- Synced with Supabase Auth users
- RLS: Users can only see their own profile

#### 2. **categories** (Product Categories)
```typescript
{
  id: UUID (PK)
  name: string
  image_url: string | null
  active: boolean
  sort_order: number
  created_at: timestamp
}
```
- Admin only: Create/edit/delete
- Public: Read access for menu display

#### 3. **products** (Menu Items/Products)
```typescript
{
  id: UUID (PK)
  category_id: UUID (FK → categories)
  name: string
  description: string | null
  price: number
  image_url: string | null
  active: boolean
  is_veg: boolean
  created_at: timestamp
}
```
- Link to categories (One product → One category)
- Has addons (One-to-many relationship)
- Has images in storage

#### 4. **addons** (Product Add-ons/Extras)
```typescript
{
  id: UUID (PK)
  product_id: UUID (FK → products)
  name: string
  price: number
  active: boolean
  created_at: timestamp
}
```
- Optional extras for products (e.g., extra cheese, sauce)
- Linked to products

#### 5. **cart_items** (Shopping Cart)
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK → profiles)
  product_id: UUID (FK → products)
  qty: number
  addon_ids: JSON | null
  line_total: number
  created_at: timestamp
}
```
- User's cart items (temporary)
- Stores selected addons as JSON array
- Recalculated totals per item

#### 6. **orders** (Order Records)
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK → profiles)
  status: enum ('pending', 'preparing', 'ready', 'completed', 'cancelled')
  total: number
  notes: string | null
  created_at: timestamp
  updated_at: timestamp
  estimated_ready_time: timestamp | null
}
```
- Main order record
- Tracks order lifecycle status
- Contains order total & notes

#### 7. **order_items** (Items in Each Order)
```typescript
{
  id: UUID (PK)
  order_id: UUID (FK → orders)
  product_id: UUID (FK → products)
  qty: number
  price_each: number
  addon_ids: JSON | null
  line_total: number
  created_at: timestamp
}
```
- Individual items within an order
- Snapshots product data at order time
- Stores addon selections as JSON

### Database Relationships
```
profiles (1) ──────────────── (N) orders
profiles (1) ──────────────── (N) cart_items

categories (1) ──────────────── (N) products
products (1) ──────────────── (N) addons
products (1) ──────────────── (N) cart_items
products (1) ──────────────── (N) order_items

orders (1) ──────────────── (N) order_items
```

### Database Migrations
- **Migration file**: `supabase/migrations/20260216043739_22f9abff-1387-4a9b-8fd1-8c1c5f66c01c.sql`
- Contains all table definitions, indexes, RLS policies
- Applies automatically on deployment

### Access Control (Row Level Security - RLS)
- **Profiles**: Users can only view/edit their own
- **Products/Categories**: Public read, admin write
- **Orders**: Users can only see their own orders
- **Admin**: Has full access to all data
- Admin role checked via RPC: `has_role(_user_id, 'admin')`

---

## 🔐 Environment Variables

Create `.env` file in project root:
```
VITE_SUPABASE_URL=https://amfrvvtfvxgsbfkntict.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

---

## 🚀 Deployment Architecture

### Frontend Deployment
- **Build output**: `dist/` folder (static files)
- **Suitable platforms**: Vercel, Netlify, Surge, GitHub Pages
- **Build command**: `npm run build` (Vite)
- **Preview**: `npm run preview`

### Backend Deployment
- **Already deployed**: Supabase (fully managed)
- **Database**: Auto-replicated, backed up
- **Authentication**: Handled by Supabase Auth
- **No backend code to deploy** (uses Supabase REST API)

### Typical Deployment Flow
```
Local Development
     ↓
Push to Git
     ↓
CI/CD Pipeline (e.g., GitHub Actions)
     ↓
Frontend Build (npm run build) → Deploy to CDN/Vercel
Backend Already Running on Supabase (no deployment needed)
     ↓
Live Application
```

---

## 📊 Data Flow Summary

### User Registration Flow
```
User inputs email/password
       ↓
Frontend calls supabase.auth.signUp()
       ↓
Supabase Auth creates user record
       ↓
AuthContext upserts profile record
       ↓
User logged in, redirected to home
```

### Order Placement Flow
```
User adds items to cart → cart_items table
User proceeds to checkout
       ↓
Frontend calls supabase.from('orders').insert()
       ↓
Creates order record → order_items records created
       ↓
Cart items cleared
       ↓
Redirect to /order-success/:orderId
       ↓
User can track order via /order-tracking/:orderId
```

### Admin Dashboard Flow
```
Admin logs in (role check via RPC)
       ↓
Can access /admin routes
       ↓
Fetch orders/products via React Query
       ↓
Update data (products, categories, orders)
       ↓
Supabase updates database & broadcasts real-time updates
       ↓
Frontend reflects changes immediately
```

---

## 🛠️ Tech Summary Table

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React + TypeScript | UI rendering |
| **Routing** | React Router | Client-side navigation |
| **State Management** | Context API + React Query | Global & server state |
| **Form Handling** | React Hook Form + Zod | Form validation |
| **Styling** | Tailwind CSS + Shadcn/UI | Responsive design |
| **API Client** | Supabase JS SDK | Backend communication |
| **Authentication** | Supabase Auth | User auth & sessions |
| **Database** | PostgreSQL 14.1 | Data persistence |
| **Backend** | Supabase REST API | API endpoints |
| **Build Tool** | Vite | Fast builds & HMR |
| **Package Manager** | Bun | Dependency management |
| **Testing** | Vitest | Unit testing |
| **Linting** | ESLint | Code quality |
| **Styling** | PostCSS + Autoprefixer | CSS processing |

---

## 📝 Key Files Reference

| File | Purpose |
|------|---------|
| [vite.config.ts](vite.config.ts) | Build configuration |
| [tsconfig.json](tsconfig.json) | TypeScript configuration |
| [tailwind.config.ts](tailwind.config.ts) | Tailwind CSS setup |
| [package.json](package.json) | Dependencies & scripts |
| [src/App.tsx](src/App.tsx) | Main app routing |
| [src/integrations/supabase/client.ts](src/integrations/supabase/client.ts) | Supabase client init |
| [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) | Auth state management |
| [supabase/config.toml](supabase/config.toml) | Local Supabase config |

---

## 🎯 Summary
- **Frontend**: React SPA with Vite, styled with Tailwind & Shadcn/UI
- **Backend**: Supabase (PostgreSQL + Auth + REST API)
- **Database**: PostgreSQL hosted on Supabase cloud
- **Architecture**: Monorepo (frontend only, backend managed)
- **Type Safety**: Full TypeScript with auto-generated Supabase types

