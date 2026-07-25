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
    markAlertRead(state, action) {
      const id = action.payload
      if (!state.readAlertIds.includes(id)) {
        state.readAlertIds.push(id)
      }
    },
    markAllAlertsRead(state, action) {
      // action.payload = array of all current alert item IDs
      state.readAlertIds = action.payload
    },
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
