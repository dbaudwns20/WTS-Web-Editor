import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  title: "",
  language: 0,
  process: null,
  version: null,
  lastModifiedStringNumber: -1,
  createdAt: null,
  updatedAt: null,
};

const ProjectSlice = createSlice({
  name: "project",
  initialState: initialState,
  reducers: {
    reset: (state) => initialState,
    setProject: (state, action) => {
      state.id = action.payload.id;
      state.title = action.payload.title;
      state.language = action.payload.language;
      state.process = action.payload.process;
      state.version = action.payload.version;
      state.lastModifiedStringNumber = action.payload.lastModifiedStringNumber;
      state.createdAt = action.payload.createdAt;
      state.updatedAt = action.payload.updatedAt;
    },
  },
});

export const { reset, setProject } = ProjectSlice.actions;
export const project = ProjectSlice.reducer;
