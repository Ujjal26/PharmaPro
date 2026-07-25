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
