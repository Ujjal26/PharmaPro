/**
 * File: uiSlice.js
 * Description: Redux slice for managing the global UI state, including the 
 * current active view, search queries, filters, and notification alerts.
 */
import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  currentView: 'dashboard',
  globalSearch: '',
  inventoryCategoryFilter: 'all',
  inventoryStatusFilter: 'all',
  inventoryDensity: 'comfortable',
  expiryWindow: '30',
  expiryCategory: 'all',
  // Notification alert read tracking
  readAlertIds: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /** Sets the current main view of the application (e.g., 'dashboard', 'inventory'). */
    setCurrentView(state, action) {
      state.currentView = action.payload
    },
    setGlobalSearch(state, action) {
      state.globalSearch = action.payload
    },
    setInventoryCategoryFilter(state, action) {
      state.inventoryCategoryFilter = action.payload
    },
    setInventoryStatusFilter(state, action) {
      state.inventoryStatusFilter = action.payload
    },
    setInventoryDensity(state, action) {
      state.inventoryDensity = action.payload
    },
    setExpiryWindow(state, action) {
      state.expiryWindow = action.payload
    },
    setExpiryCategory(state, action) {
      state.expiryCategory = action.payload
    },
    /** Marks a specific alert as read. */
    markAlertRead(state, action) {
      const id = action.payload
      if (!state.readAlertIds.includes(id)) {
        state.readAlertIds.push(id)
      }
    },
    /** Marks all provided alerts as read. */
    markAllAlertsRead(state, action) {
      // action.payload = array of all current alert item IDs
      state.readAlertIds = action.payload
    },
    /** Resets the read alerts state. */
    resetAlerts(state) {
      state.readAlertIds = []
    },
  },
})

export const {
  setCurrentView,
  setGlobalSearch,
  setInventoryCategoryFilter,
  setInventoryStatusFilter,
  setInventoryDensity,
  setExpiryWindow,
  setExpiryCategory,
  markAlertRead,
  markAllAlertsRead,
  resetAlerts,
} = uiSlice.actions

export default uiSlice.reducer
