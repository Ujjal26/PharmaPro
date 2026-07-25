import { configureStore } from '@reduxjs/toolkit'
import inventoryReducer from './inventorySlice'
import uiReducer from './uiSlice'
import stockEntryReducer from './stockEntrySlice'
import dispenseReducer from './dispenseSlice'

export const store = configureStore({
  reducer: {
    inventory: inventoryReducer,
    ui: uiReducer,
    stockEntry: stockEntryReducer,
    dispense: dispenseReducer,
  },
})
