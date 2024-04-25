import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  title: "",
  language: 0,
  process: null,
  version: null,
  lastModifiedStringNumber: -1,
  dateCreated: null,
  lastUpdated: null,
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
      state.dateCreated = action.payload.dateCreated;
      state.lastUpdated = action.payload.lastUpdated;
    },
  },
});

export const { reset, setProject } = ProjectSlice.actions;
export const project = ProjectSlice.reducer;
