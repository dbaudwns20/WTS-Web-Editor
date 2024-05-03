import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  projectId: "",
  stringNumber: "",
  originalText: "",
  translatedText: "",
  comment: "",
  isCompleted: false,
  lastUpdated: null,
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
      state.isCompleted = action.payload.isCompleted;
      state.lastUpdated = action.payload.lastUpdated;
    },
  },
});

export const { reset, setString } = StringSlice.actions;
export const string = StringSlice.reducer;
