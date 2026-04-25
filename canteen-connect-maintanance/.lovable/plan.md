

# 🍛 Campus Canteen Online Ordering App — Full Build Plan

## Overview
A production-ready, mobile-first canteen ordering app where students/staff browse menus, order food, pick a time slot, pay via Stripe, and get a token + QR code for pickup. Admins manage the entire operation from a dedicated panel.

---

## Phase 1: Database & Auth Foundation

### Database Schema (Supabase)
Set up all tables with RLS enabled:
- **profiles** — user name, phone, email, college_id (auto-created on signup via trigger)
- **user_roles** — separate table for admin/customer roles (security best practice)
- **categories** — name, sort_order, active flag, image
- **products** — linked to category, name, description, price, image_url, is_veg, rating, active
- **addons** — linked to product, name, price, active
- **cart_items** — user's cart with product, addons (jsonb), qty, line_total
- **orders** — status enum (confirmed/preparing/ready/picked_up), pickup_slot, totals, token_no, qr_code_url, payment_status
- **order_items** — individual items in each order
- **payments** — Stripe reference, amount, status
- **settings** — single-row table for cutoff times and slot configuration

### RLS Policies
- Customers read/update only their own data
- Public can read active categories/products/addons
- Admins can manage everything (via `has_role()` security definer function)
- No table publicly writable

### Authentication
- Email + Password signup/login
- Phone OTP login (code ready — requires Twilio setup in Supabase dashboard)
- Google Sign-in (requires Google OAuth config in Supabase dashboard)

### Seed Data
- 8 categories (Breakfast, Lunch, Snacks, Beverages, etc.)
- 40 products across categories
- 20 add-ons (extra cheese, extra spice, etc.)

---

## Phase 2: Customer App (Mobile-First UI)

### Design System
- Light theme with deep navy primary buttons
- Orange accents for highlights (ratings, active states)
- Rounded cards (18-20px radius), subtle shadows, large food images
- Bottom navigation bar
- Smooth fade/slide transitions
- Loading skeletons throughout

### Screens
1. **Splash Screen** — App branding with auto-redirect
2. **Login/Signup** — Tabs for email, phone OTP, and Google sign-in
3. **Home** — Search bar, category pills, daily specials carousel, popular items grid
4. **Category Listing** — Filtered product cards with veg/non-veg badge, price, quick add
5. **Item Detail** — Large image, description, add-ons selector, quantity stepper, "Add to Cart"
6. **Cart** — Item list with qty stepper, remove option, add-ons summary, pickup slot selector (time slots based on settings/cutoffs), order totals
7. **Checkout** — Order summary, Stripe payment integration
8. **Order Success** — Order ID, daily token number (e.g., B-021), QR code, estimated pickup time
9. **Order Tracking** — Timeline view showing Confirmed → Preparing → Ready with realtime updates
10. **Order History** — Past orders list with "Reorder" button
11. **Profile** — Name, phone/email display, logout

---

## Phase 3: Admin Panel

### Admin Screens
1. **Admin Login** — Same auth but role-gated access
2. **Dashboard** — Today's stats: total orders, pending, preparing, ready, completed. Live order feed
3. **Manage Categories** — CRUD with drag-to-reorder and active toggle
4. **Manage Products** — CRUD with image upload (Supabase Storage), veg/non-veg, price, add-ons management
5. **Stock & Availability** — Quick toggle products in/out of stock
6. **Cutoff Time Settings** — Set breakfast/lunch/snacks cutoff times, manage available pickup slots
7. **Order Management** — View incoming orders, update status (Confirmed → Preparing → Ready), print/view token

---

## Phase 4: Payments (Stripe)

- Enable Lovable's native Stripe integration
- Stripe Checkout for card payments (+ Google Pay / Apple Pay via Stripe)
- Payment status flow: pending → success / failed
- Edge Function for secure payment verification via Stripe webhooks
- Link payments to orders in the database

---

## Phase 5: Business Logic & Realtime

### Token System
- Auto-generate sequential daily tokens (e.g., B-001 for breakfast, L-042 for lunch)
- Reset token counter daily

### QR Code
- Generate QR code on the client containing order_id + token_no
- Display on order success screen and in order history

### Pickup Slots
- Show only available future slots based on current time
- Enforce cutoff times (no breakfast orders after 9:30 AM, etc.)
- Configurable by admin

### Realtime Updates
- Supabase Realtime subscriptions on orders table
- Customer sees live status changes without refreshing

### Stock Control
- Out-of-stock items shown as disabled, cannot be added to cart
- Admin can toggle stock status instantly

---

## Phase 6: Polish & Deploy

- Error handling with user-friendly toast messages
- Loading skeletons on all data-fetching screens
- Reusable component library (Card, Button, Badge, BottomNav, StatusBadge)
- Responsive design (mobile-first, works on desktop too)
- Deploy-ready build

