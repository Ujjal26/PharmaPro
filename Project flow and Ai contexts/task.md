# PharmaPro Feature Expansion – Task List

## Group 1 · Foundations
- [x] Create task.md
- [/] Fix .env (VITE_ prefix)
- [ ] Update Firebase.js (auth + db exports)
- [ ] Create dispenseSlice.js
- [ ] Update inventorySlice.js (remove, decrement, Firestore thunks)
- [ ] Update uiSlice.js (readAlertIds, markAlertRead)
- [ ] Update stockEntrySlice.js (monthlySnapshots seed data)
- [ ] Update store.js (add dispenseSlice)

## Group 2 · Firebase Auth
- [ ] Create AuthContext.jsx
- [ ] Create LoginPage.jsx + LoginPage.css
- [ ] Create SignupPage.jsx + SignupPage.css

## Group 3 · UI Component Updates
- [ ] Update UserAuthPanel.jsx + css (real user, logout)
- [ ] Update Header.jsx + css (mark-as-read)
- [ ] Update ExpiryMonitorCards.jsx + css (clear button + confirm)
- [ ] Create StockTrendGraph.jsx + update ChartComponents.css
- [ ] Update Dashboard.jsx (add StockTrendGraph)

## Group 4 · New Dispense View
- [ ] Create DispenseView.jsx + DispenseView.css

## Group 5 · Layout & Routing
- [x] Update SideNavbar.jsx + css (Dispense nav item)
- [x] Update App.jsx (auth routing + dispense view)
- [x] Update main.jsx (AuthProvider)
- [x] Update index.css (responsive tokens)
- [x] Update App.css (mobile layout)

## Group 6 · Enhancements & Fixes (Latest)
- [x] Update Firebase.js to export GoogleAuthProvider
- [x] Update AuthContext.jsx with loginWithGoogle function
- [x] Add "Sign in with Google" button to LoginPage & SignupPage
- [x] Move Firebase config variables to firebase.js directly and delete .env file.
- [x] Refactor AuthContext.jsx to create users/{userId} documents upon signup and login.
- [x] Refactor inventorySlice.js to manage stock in the users/{userId}/medicine subcollection.
- [x] Refactor dispenseSlice.js to log dispense history in users/{userId}/dispense_history.
- [x] Wire up App.jsx, StockEntryForm.jsx, DispenseView.jsx, and ExpiryMonitorCards.jsx to pass the authenticated user's ID to Redux thunks.
- [x] Delete the redundant medicineSlice.js and restore inventorySlice.js as the sole source of truth for the UI.
- [x] Update addItemToFirestore to safely merge stock quantity if medicineName and batchId match perfectly, avoiding duplicates.
- [x] Create CsvImportExport.jsx component to allow batch downloading and uploading CSV data.
- [x] Integrate CsvImportExport directly into Dashboard.jsx.
- [x] Fix StockEntryForm to dispatch addItemToFirestore
- [x] Update currency from USD ($) to INR (₹) across components
- [x] Capitalize inputs in StockEntryForm visually and programmatically
- [x] Remove extra "Dispense" nav link and rely on CTA button
