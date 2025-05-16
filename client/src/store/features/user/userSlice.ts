import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
   id: string;
   email: string;
   userName: string;
   profilePic?: string; 
}

export interface userStatus{
    userInfo : User | null;
    isAuthenticated : boolean
}

const initialState : userStatus = {
    userInfo : null,
    isAuthenticated : false
}
 
 const userSlice = createSlice({
    name : "userSlice",
    initialState,
    reducers : {
       addUser : (state, action: PayloadAction<User>) => {
        state.isAuthenticated = true; 
        state.userInfo = action.payload;   
       },
       removeUser : (state)  => {
        state.isAuthenticated = false;
        state.userInfo = null;
       }
    }
 });


 export const {addUser, removeUser} = userSlice.actions

 export default userSlice.reducer