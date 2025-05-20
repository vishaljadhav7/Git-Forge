
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '@/store/features/user/userSlice'
import { api } from './features/api'

export const makeStore = () => {
  return configureStore({
    reducer: {
        user : userReducer,
        [api.reducerPath]: api.reducer,
      },
      middleware: (getDefault) => getDefault().concat(api.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']