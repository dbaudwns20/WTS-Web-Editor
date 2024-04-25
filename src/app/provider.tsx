"use client";

import { store, persistor } from "@/stores/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

const ProviderWrapper = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ProviderWrapper;
