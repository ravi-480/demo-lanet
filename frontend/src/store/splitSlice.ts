import { SplitState } from "@/Interface/interface";
import { Action, createSlice } from "@reduxjs/toolkit";

const initialState: SplitState = {
  eventId: null,
  vendors: [],
};

const splitVendorPrice = createSlice({
  name: "split",
  initialState,
  reducers: {
    addVendorToSplit: (state, action) => {
      (state.eventId = action.payload.eventId),
        (state.vendors = action.payload.selected);
    },
  },
});

export const { addVendorToSplit } = splitVendorPrice.actions;

export default splitVendorPrice.reducer;
