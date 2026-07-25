/* eslint-disable no-unused-vars */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "../firebase.js";

/* ─── Initial state ─── */
const initialState = {
  cart: [], // [{ id, medicineName, batchId, category, unitPrice, maxQty, dispenseQty }]
  markupPercent: 30, // default 30% markup for profit calculation
  submitting: false,
  submitError: null,
  lastSubmittedAt: null,
};

/* ─── Async: Submit dispense to Firestore ─── */
export const submitDispense = createAsyncThunk(
  "dispense/submit",
  async (userId, { getState, dispatch }) => {
    if (!userId) throw new Error("User ID is required to submit dispense");
    const { dispense, inventory } = getState();
    const cart = dispense.cart;
    if (cart.length === 0) throw new Error("Cart is empty");

    const totalCost = cart.reduce((s, i) => s + i.dispenseQty * i.unitPrice, 0);
    const markup = dispense.markupPercent;
    const totalRevenue = totalCost * (1 + markup / 100);

    // 1. Write/Update dispense history docs per item and 2. Decrement inventory
    const updates = [];
    
    for (const cartItem of cart) {
      // History Update
      const itemCost = cartItem.dispenseQty * cartItem.unitPrice;
      const itemRevenue = itemCost * (1 + markup / 100);
      const itemProfit = itemRevenue - itemCost;
      
      const docId = `${cartItem.medicineName}_${cartItem.batchId}`.replace(/[^a-zA-Z0-9]/g, '_');
      const historyRef = doc(db, "users", userId, "dispense_history", docId);
      
      updates.push(
        setDoc(historyRef, {
          medicineName: cartItem.medicineName,
          batchId: cartItem.batchId,
          category: cartItem.category || '',
          totalQuantityDispensed: increment(cartItem.dispenseQty),
          totalRevenue: increment(itemRevenue),
          totalProfit: increment(itemProfit),
          lastDispensedAt: serverTimestamp()
        }, { merge: true }).catch(() => console.warn(`History update failed for ${cartItem.medicineName}`))
      );

      // 2. Decrement / remove each item in Firestore
      const inventoryItem = inventory.items.find((i) => i.id === cartItem.id);
      if (!inventoryItem) continue;
      const newQty = inventoryItem.quantity - cartItem.dispenseQty;
      if (newQty <= 0) {
        updates.push(
          deleteDoc(doc(db, "users", userId, "medicine", cartItem.id)).catch(
            () => console.warn(`Firestore delete failed for ${cartItem.id}`),
          ),
        );
      } else {
        updates.push(
          updateDoc(doc(db, "users", userId, "medicine", cartItem.id), {
            quantity: newQty,
          }).catch(() =>
            console.warn(`Firestore update failed for ${cartItem.id}`),
          ),
        );
      }
    }
    await Promise.allSettled(updates);

    return { cart };
  },
);

/* ─── Slice ─── */
const dispenseSlice = createSlice({
  name: "dispense",
  initialState,
  reducers: {
    addToCart(state, action) {
      const item = action.payload;
      const existing = state.cart.find((c) => c.id === item.id);
      if (existing) {
        existing.dispenseQty = Math.min(
          existing.dispenseQty + (item.dispenseQty || 1),
          existing.maxQty,
        );
      } else {
        state.cart.push({
          id: item.id,
          medicineName: item.medicineName,
          batchId: item.batchId,
          category: item.category,
          unitPrice: item.unitPrice,
          maxQty: item.quantity,
          dispenseQty: Math.min(item.dispenseQty || 1, item.quantity),
        });
      }
    },
    removeFromCart(state, action) {
      state.cart = state.cart.filter((c) => c.id !== action.payload);
    },
    updateCartQty(state, action) {
      const { id, qty } = action.payload;
      const item = state.cart.find((c) => c.id === id);
      if (item) {
        item.dispenseQty = Math.max(1, Math.min(qty, item.maxQty));
      }
    },
    clearCart(state) {
      state.cart = [];
    },
    setMarkup(state, action) {
      state.markupPercent = Math.max(0, Math.min(200, Number(action.payload)));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitDispense.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitDispense.fulfilled, (state) => {
        state.submitting = false;
        state.cart = [];
        state.lastSubmittedAt = new Date().toISOString();
      })
      .addCase(submitDispense.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.error.message;
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateCartQty,
  clearCart,
  setMarkup,
} = dispenseSlice.actions;
export default dispenseSlice.reducer;
