# PharmaPro CIS — Feature Expansion Plan

## Overview
Six major feature areas being added to the existing React + Redux + Vite project.

---

## Open Questions

> [!IMPORTANT]
> **Firebase Firestore vs Redux-only**: The current inventory lives in Redux (seeded data). For the "New Dispense" submit to delete from a Firebase database, inventory must also be stored in Firestore. This plan proposes migrating inventory reads/writes to **Firestore** (collection: `inventory`, per-user documents under each authenticated user's UID). Should inventory data be **shared across all users** (single collection) or **per-user** (each pharmacist has their own stock)?

> [!IMPORTANT]
> **Firestore `dispensing_logs` collection**: When a dispense is submitted, the cleared items are moved to a `dispense_history` sub-collection. Should cleared items be fully deleted from the `inventory` collection, or should their quantity be decremented (partial dispense)?

> [!WARNING]
> The `.env` file currently uses non-`VITE_` prefixed keys (`API_KEY` instead of `VITE_API_KEY`), but `Firebase.js` reads `import.meta.env.VITE_API_KEY`. This means the current Firebase config likely fails silently. The plan includes fixing the `.env` file.

---

## Proposed Changes

---

### 1. Firebase Setup & Auth

#### [MODIFY] [Firebase.js](file:///e:/Programming/PharmaPro/Frontend/Firebase.js)
- Export `auth` (`getAuth`) and `db` (`getFirestore`) instances
- Fix `.env` mismatch (keys need `VITE_` prefix)

#### [MODIFY] [.env](file:///e:/Programming/PharmaPro/Frontend/.env)
- Prefix all keys with `VITE_` to work with Vite's env system

#### [NEW] `src/user auth/AuthContext.jsx`
- React context providing `currentUser`, `loading`, `login`, `signup`, `logout` using Firebase Auth
- Wraps the entire app in `main.jsx`

#### [NEW] `src/user auth/LoginPage.jsx` + `LoginPage.css`
- Premium login form: email + password, "Remember me", forgot password link
- Shows on unauthenticated state, replaces the full app shell
- Animated PharmaPro branding, gradient card, primary blue focus rings

#### [NEW] `src/user auth/SignupPage.jsx` + `SignupPage.css`
- Signup form: full name, email, password, confirm password, role selector (Pharmacist/Technician/Manager)
- Inline validation, password strength indicator

#### [MODIFY] `src/user auth/UserAuthPanel.jsx`
- Display logged-in user's name/email from `currentUser`
- Add logout button/dropdown

#### [MODIFY] `src/main.jsx`
- Wrap with `AuthProvider`

#### [MODIFY] `src/App.jsx`
- Conditionally render `<LoginPage>` / `<SignupPage>` if not authenticated

---

### 2. Redux Slices — New Actions

#### [MODIFY] `src/slices/inventorySlice.js`
- Add `removeInventoryItem(id)` action (for expiry card clear)
- Add `decrementQuantity({ id, qty })` action (for dispense)
- Add Firestore async thunks: `fetchInventory`, `addItemToFirestore`, `removeItemFromFirestore`

#### [MODIFY] `src/slices/uiSlice.js`
- Add `readAlerts` array to track read notification IDs
- Add `markAlertRead(id)` action
- Add `markAllAlertsRead()` action

#### [NEW] `src/slices/dispenseSlice.js`
- State: `cart: []` (items selected for dispensing with quantities)
- Actions: `addToCart`, `removeFromCart`, `updateCartQty`, `clearCart`
- Async thunk: `submitDispense` → writes to Firestore `dispense_history`, decrements inventory

---

### 3. Notification Alerts — Mark as Read

#### [MODIFY] `src/headers/Header.jsx`
- Notification bell shows unread expiry alerts
- Each alert item in dropdown has a "Mark as read ✓" button
- "Mark all as read" link at top of dropdown
- Badge count shows only **unread** alerts
- Read alerts persist in Redux `ui.readAlerts` array

---

### 4. Expiry Monitor — Clear Button on Cards

#### [MODIFY] `src/cards/ExpiryMonitorCards.jsx`
- Add `Clear Item` button at the bottom of each expiry card
- Dispatches `removeInventoryItem(item.id)` (removes from local Redux state)
- If Firestore is connected, also calls `removeItemFromFirestore`
- Confirm dialog: "Mark this batch as cleared?" with Yes/Cancel

---

### 5. Stock Line Graph (Current + Past 3 Months)

#### [NEW] `src/chart components/StockTrendGraph.jsx`
- Pure CSS/SVG line graph (no chart library) showing stock value/quantity over 4 months
- X-axis: 4 months (e.g., Apr, May, Jun, Jul)
- Y-axis: total quantity or total value
- Line is animated on mount (SVG stroke-dasharray/dashoffset animation)
- Data generated from `stockEntry.recentEntries` + seeded history data in a new Redux slice
- Tooltip on hover showing exact value
- Toggle between "Total Stock Units" and "Total Value" views

#### [MODIFY] `src/slices/stockEntrySlice.js`
- Add `monthlySnapshots` array with 3 months of seeded historical data

#### [MODIFY] `src/dashboard/Dashboard.jsx`
- Add `<StockTrendGraph>` below the existing dashboard grid

---

### 6. New Dispense Tab (Separate from Stock Entry)

#### [NEW] `src/dispense/DispenseView.jsx` + `DispenseView.css`
Full two-panel layout:
- **Left: Inventory Selector Table**
  - Same filter controls as Inventory tab (Category, Status, Rows per page)
  - Radio button (single select) on each row to select a medicine for dispensing
  - Quantity input field per row (how many to dispense)
  - Shows: Medicine Name, Batch ID, Category, Stock Level, Unit Price, Expiry, Status
- **Right: Dispense Cart / Summary Panel** (sticky)
  - Lists selected items with quantities
  - Shows unit cost per item
  - **Total Cost** (sum of qty × unit price)
  - **Total Profit** (cost - wholesale, configurable margin % input)
  - **Submit Dispense** button → calls Firestore, decrements stock, logs to `dispense_history`
  - **Clear Cart** button

#### [MODIFY] `src/side navbar/SideNavbar.jsx`
- Add `New Dispense` nav item pointing to `'dispense'` view (separate from stock-entry)
- Keep the CTA button but change it to open the dispense view

#### [MODIFY] `src/slices/uiSlice.js`
- Add `'dispense'` as a valid currentView value

#### [MODIFY] `src/App.jsx`
- Add `<DispenseView>` as a rendered route for `currentView === 'dispense'`

---

### 7. Responsive Design

#### [MODIFY] All CSS files
- Mobile-first breakpoints at: 480px, 640px, 768px, 1024px, 1280px
- Sidebar collapses to bottom tab bar on mobile (≤768px)
- Header stacks vertically on mobile
- All grids collapse to single-column
- Table horizontal scroll with fixed first column on mobile
- Touch-friendly tap targets (minimum 44px)
- Hamburger menu for sidebar on tablet/mobile

---

### 8. Enhancements (Google Auth, Currency, Data Cleanup)

#### [MODIFY] `Firebase.js` & `src/user auth/AuthContext.jsx`
- Add and configure `GoogleAuthProvider`.
- Export `loginWithGoogle` from context.

#### [MODIFY] `src/user auth/LoginPage.jsx` & `SignupPage.jsx`
- Add "Sign in with Google" button with SVG logo.

#### [MODIFY] `src/slices/inventorySlice.js` & `src/slices/stockEntrySlice.js`
- Remove all `SEED_ITEMS` and mock historical data to prepare for production.
- Ensure state initializes as empty arrays.

#### [MODIFY] `src/stock Entry form/StockEntryForm.jsx` & `.css`
- Fix submission bug: replace `addInventoryItem` with `addItemToFirestore` async thunk.
- Programmatically format inputs (`text-transform: capitalize` visually, and JS capitalization prior to dispatch).

#### [MODIFY] Global Localization
- Replace all USD (`$`) symbols with INR (`₹`) in `StockTrendGraph.jsx`, `InventoryTable.jsx`, `DispenseView.jsx`, `SummaryCards.jsx`, and `StockEntryForm.jsx`.

---

## Verification Plan

### Automated
- Dev server builds without errors: `npm run dev`

### Manual Verification
1. Open http://localhost:5173/ → redirected to Login page ✓
2. Sign up with email/password → lands on Dashboard ✓
3. Notification bell → shows expiry alerts → Mark as Read removes badge ✓
4. Expiry Monitor → Clear button on each card removes it ✓
5. Dashboard → line graph visible with 4-month trend ✓
6. New Dispense tab → select item via radio, enter qty, see cart totals, submit ✓
7. After submit: inventory quantities decrease ✓
8. Resize to 375px mobile → sidebar becomes bottom bar, all views scroll properly ✓
### 9. Firestore Data Architecture: Per-User Subcollections (NEW)

Currently, the application attempts to read/write medicine and dispense history to global collections (e.g., `pharmacy_inventory`). We are refactoring this so that every user has their own isolated data space.

#### [MODIFY] `AuthContext.jsx`
When a user signs up or logs in via Google, we will create/update a root document for them:
- **Path**: `users/{userId}`
- **Data**: `{ email, displayName, role: 'pharmacist', lastLogin }`

#### [MODIFY] `inventorySlice.js`
We will abandon the global `pharmacy_inventory` collection.
- **Path**: `users/{userId}/medicine`
- **Updates**: Modify `fetchInventory`, `addItemToFirestore`, `removeItemFromFirestore`, and `decrementItemInFirestore` thunks to accept `userId` as an argument and write to this subcollection path.
- *Note: We will revert the temporary `medicineSlice.js` change so the whole app uses `inventorySlice.js` as the single source of truth for the inventory table and dashboard.*

#### [MODIFY] `dispenseSlice.js`
When a user dispenses medicine, we need to log it to their personal history and decrement their personal medicine stock.
- **History Path**: `users/{userId}/dispense_history`
- **Medicine Path**: `users/{userId}/medicine/{medicineId}`
- **Updates**: Modify the `submitDispense` thunk to accept `userId` and use these paths.

#### [MODIFY] Component Updates (Pass `userId` to Redux)
Because Redux lives outside of React Context, it doesn't automatically know who is logged in. We need to pass the `currentUser.uid` from `useAuth()` into our dispatched actions:
- **`App.jsx`**: Pass `uid` to `fetchInventory` on mount.
- **`StockEntryForm.jsx`**: Pass `uid` to `addItemToFirestore`.
- **`DispenseView.jsx`**: Pass `uid` to `submitDispense`.
- **`ExpiryMonitorCards.jsx`**: Pass `uid` to `removeItemFromFirestore` when clearing expired items.

### 10. CSV Import & Export (NEW)

#### [NEW] `src/dashboard/CsvImportExport.jsx` + `CsvImportExport.css`
A new panel/component in the dashboard that provides two main buttons:
- **Export to CSV**: Takes the current `inventory` data from Redux, formats it into standard CSV rows (Medicine Name, Category, Batch ID, Quantity, Min Stock, Unit Price, Expiry Date), and triggers a browser download.
- **Import from CSV**: A file input that accepts a `.csv` file. It will parse the rows and dispatch `addItemToFirestore` for each valid row. Because we recently updated `addItemToFirestore` to merge quantities for matching `medicineName` + `batchId`, this will gracefully update existing stock without duplicating rows.

#### [MODIFY] `src/dashboard/Dashboard.jsx`
- Place the new `<CsvImportExport />` component into the dashboard view (likely right above or below the KPI Summary Cards).
