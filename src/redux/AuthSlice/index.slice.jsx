// Importing necessary modules and components
import { createSlice } from "@reduxjs/toolkit";
export const authSlice = createSlice({
  name: "auth",
  initialState: {
    userAuthdata: {},
  },
  reducers: {
      userLoginAuthdata: (state, action) => ({
        ...state,
        userAuthdata: { ...action.payload },
      }),
      logoutUserAuthAction: (state) => {
        return {
          ...state,
          userAuthdata: {},
        };
      },
      updateUserAuthDataAction: (state, action) => ({
        ...state,
        userAuthdata: { ...state.userAuthdata, ...action.payload },
      }),
  },
});

export const {
  userLoginAuthdata,
  logoutUserAuthAction,
  updateUserAuthDataAction,
} = authSlice.actions;

export const updateUserAuthdataLogin = (data) => async (dispatch) => {
  try {
    dispatch(userLoginAuthdata(data));
  } catch (error) {
    console.log(error)
  }
};

export const logout = (navigate) => async (dispatch) => {
  try {
    dispatch(logoutSuperAdminAction());
    navigate("/");
  } catch (error) {
        console.log(error)
  }
};

export const getUserAuthData = (state) => state.auth.userAuthdata;

export default authSlice.reducer;
