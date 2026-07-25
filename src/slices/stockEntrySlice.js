/**
 * File: stockEntrySlice.js
 * Description: Redux slice for managing the history and state of stock entries.
 * Handles the recording of new stock additions.
 */
import { createSlice } from '@reduxjs/toolkit'

export const MONTHLY_HISTORY = []

const initialState = {
  submissions: [],
  recentEntries: [],
}

const stockEntrySlice = createSlice({
  name: 'stockEntry',
  initialState,
  reducers: {
    /**
     * Submit a new stock entry and add it to the recent entries list.
     * Keeps only the 8 most recent entries.
     */
    submitStockEntry(state, action) {
      state.submissions.unshift(action.payload)
      state.recentEntries.unshift({
        id: action.payload.id,
        medicineName: action.payload.medicineName,
        quantity: action.payload.quantity,
        batchId: action.payload.batchId,
        submittedAt: action.payload.submittedAt,
      })
      state.recentEntries = state.recentEntries.slice(0, 8)
    },
  },
})

export const { submitStockEntry } = stockEntrySlice.actions
export default stockEntrySlice.reducer
