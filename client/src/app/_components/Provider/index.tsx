import React from "react";
import StoreProvider from "@/app/StoreProvider";

export default function Provider({children}: {children : React.ReactNode}) {
  return (
    <StoreProvider>
     {children}
    </StoreProvider>
  )
}     

