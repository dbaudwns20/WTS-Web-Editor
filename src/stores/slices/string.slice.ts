import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  projectId: "",
  stringNumber: "",
  originalText: "",
  translatedText: "",
  comment: "",
  createdAt: null,
  updatedAt: null,
  completedAt: null,
};

const StringSlice = createSlice({
  name: "string",
  initialState,
  reducers: {
    reset: (state) => initialState,
    setString: (state, action) => {
      state.id = action.payload.id;
      state.projectId = action.payload.projectId;
      state.stringNumber = action.payload.stringNumber;
      state.originalText = action.payload.originalText;
      state.translatedText = action.payload.translatedText;
      state.comment = action.payload.comment;
      state.createdAt = action.payload.createdAt;
      state.updatedAt = action.payload.updatedAt;
      state.completedAt = action.payload.completedAt;
    },
  },
});

export const { reset, setString } = StringSlice.actions;
export const string = StringSlice.reducer;
