import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { CategoryMeta } from "../../api";
import { fetchMeta } from "../../api";

interface CategoriesState {
  list: CategoryMeta[];
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: CategoriesState = {
  list: [],
  status: "idle",
};

export const loadCategories = createAsyncThunk("categories/load", async () => {
  const data = await fetchMeta();
  return data;
});

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCategories.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        loadCategories.fulfilled,
        (state, action: PayloadAction<CategoryMeta[]>) => {
          state.status = "succeeded";
          state.list = action.payload;
        }
      )
      .addCase(loadCategories.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export default categorySlice.reducer;
