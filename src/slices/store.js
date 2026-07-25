/**
 * File: store.js
 * Description: Redux store configuration. Combines all slice reducers
 * (inventory, ui, stockEntry, dispense) into a single centralized store
 * for global state management.
 */
import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer from './inventorySlice'
import uiReducer from './uiSlice'
import stockEntryReducer from './stockEntrySlice'
import dispenseReducer from './dispenseSlice'

/**
 * Configure and export the Redux store.
 */
export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    ui: uiReducer,
    stockEntry: stockEntryReducer,
    dispense: dispenseReducer,
  },
})
