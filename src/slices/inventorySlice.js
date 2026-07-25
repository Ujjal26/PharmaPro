/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase.js";

const COLLECTION = "pharmacy_inventory";

/* ─── Async thunks ─── */
export const fetchInventory = createAsyncThunk(
  "inventory/fetch",
  async (userId) => {
    if (!userId) return [];
    try {
      const snapshot = await getDocs(
        collection(db, "users", userId, "medicine"),
      );
      if (snapshot.empty) {
        return [];
      }
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      console.warn("Firestore fetch failed");
      return [];
    }
  },
);

export const addItemToFirestore = createAsyncThunk(
  "inventory/addToFirestore",
  async ({ item, userId }, { getState }) => {
    if (!userId) return item;
    
    const { inventory } = getState();
    const existingItem = inventory.items.find(
      (i) => i.medicineName.toLowerCase() === item.medicineName.toLowerCase() && 
             i.batchId.toLowerCase() === item.batchId.toLowerCase()
    );

    try {
      if (existingItem) {
        const newQty = existingItem.quantity + item.quantity;
        await updateDoc(doc(db, "users", userId, "medicine", existingItem.id), {
          quantity: newQty,
        });
        return { ...existingItem, quantity: newQty, _isUpdate: true };
      } else {
        await setDoc(doc(db, "users", userId, "medicine", item.id), item);
        return { ...item, _isUpdate: false };
      }
    } catch {
      console.warn("Firestore operation failed – added/updated locally only");
      if (existingItem) {
        return { ...existingItem, quantity: existingItem.quantity + item.quantity, _isUpdate: true };
      }
      return { ...item, _isUpdate: false };
    }
  },
);

export const removeItemFromFirestore = createAsyncThunk(
  "inventory/removeFromFirestore",
  async ({ id, userId }) => {
    if (!userId) return id;
    try {
      await deleteDoc(doc(db, "users", userId, "medicine", id));
    } catch {
      console.warn("Firestore delete failed – removed locally only");
    }
    return id;
  },
);

export const decrementItemInFirestore = createAsyncThunk(
  "inventory/decrementInFirestore",
  async ({ id, newQty, userId }) => {
    if (!userId) return { id, newQty };
    try {
      if (newQty <= 0) {
        await deleteDoc(doc(db, "users", userId, "medicine", id));
      } else {
        await updateDoc(doc(db, "users", userId, "medicine", id), {
          quantity: newQty,
        });
      }
    } catch {
      console.warn("Firestore decrement failed – updated locally only");
    }
    return { id, newQty };
  },
);

/* ─── Slice ─── */
const inventorySlice = createSlice({
  name: "inventory",
  initialState: {
    items: [],
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    addInventoryItem(state, action) {
      state.items.unshift(action.payload);
    },
    removeInventoryItem(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    decrementQuantity(state, action) {
      const { id, qty } = action.payload;
      const item = state.items.find((i) => i.id === id);
      if (item) {
        item.quantity = Math.max(0, item.quantity - qty);
        if (item.quantity === 0) {
          state.items = state.items.filter((i) => i.id !== id);
        }
      }
    },
    setInventory(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.initialized = true;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.initialized = true;
      })
      .addCase(addItemToFirestore.fulfilled, (state, action) => {
        if (action.payload._isUpdate) {
          const index = state.items.findIndex(i => i.id === action.payload.id);
          if (index !== -1) {
            state.items[index] = action.payload;
          }
        } else {
          const exists = state.items.find((i) => i.id === action.payload.id);
          if (!exists) state.items.unshift(action.payload);
        }
      })
      .addCase(removeItemFromFirestore.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload);
      })
      .addCase(decrementItemInFirestore.fulfilled, (state, action) => {
        const { id, newQty } = action.payload;
        const item = state.items.find((i) => i.id === id);
        if (item) {
          if (newQty <= 0) {
            state.items = state.items.filter((i) => i.id !== id);
          } else {
            item.quantity = newQty;
          }
        }
      });
  },
});

export const {
  addInventoryItem,
  removeInventoryItem,
  decrementQuantity,
  setInventory,
} = inventorySlice.actions;
export default inventorySlice.reducer;
