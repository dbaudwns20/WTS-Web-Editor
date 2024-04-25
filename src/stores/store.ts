import { combineReducers, configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistStore, persistReducer } from "redux-persist";

import { project } from "./slices/project.slice";

// config 작성
const persistConfig = {
  key: "wtswebeditor", // 로컬스토리지에 저장할 키값
  storage, // localStorage or sessionStorage
  whitelist: ["project"], // 저장할 리듀서
};

const reducers = combineReducers({
  project,
});

// persistReduce 생성
const persistedReducer = persistReducer(persistConfig, reducers);

// 리덕스 store 생성함수
const makeStore = () => {
  // 슬라이스 통합 store 생성
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
    devTools: process.env.NODE_ENV === "development", // 개발자도구 설정
  });

  return store;
};

export const store = makeStore();
export const persistor = persistStore(store);
