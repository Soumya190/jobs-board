import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { IEditProfile, IUserLogin, IAuth } from '@/lib/utils/interface';
import { getDataAPI, patchDataAPI, postDataAPI } from '@/lib/utils/fetchData';
import { uploadFile } from '@/lib/utils/uploadHelper';
import Cookie from 'js-cookie';

interface IEditProfileType extends IEditProfile {
  tempAvatar: File[];
  tempCv: File[];
  token: string;
}

export const login = createAsyncThunk(
  'auth/login',
  async (userData: IUserLogin, thunkAPI) => {
    try {
      thunkAPI.dispatch({ type: 'alert/alert', payload: { loading: true } });

      const res = await postDataAPI('auth/login', userData);
      localStorage.setItem('jobseek_logged', 'true');

      Cookie.set('jobseek_rfToken', res.data.refreshToken, {
        expires: 30,
      });

      thunkAPI.dispatch({ type: 'alert/alert', payload: { success: res.data.msg } });

      return {
        accessToken: res.data.accessToken,
        user: res.data.user,
      };
    } catch (err) {
      const error = err as { response?: { data: { msg: string } } }; // Specify the error type
      thunkAPI.dispatch({ type: 'alert/alert', payload: { error: error.response?.data.msg || 'An error occurred' } });
      return thunkAPI.rejectWithValue(error.response?.data.msg || 'An error occurred'); // Return a value for error handling
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, thunkAPI) => {
    const logged = localStorage.getItem('jobseek_logged');
    if (logged !== 'true') return;

    try {
      const res = await getDataAPI('auth/refresh_token');
      return res.data;
    } catch (err) {
      const error = err as { response?: { data: { msg: string } } }; // Specify the error type
      thunkAPI.dispatch({ type: 'alert/alert', payload: { error: error.response?.data.msg || 'An error occurred' } });
      return thunkAPI.rejectWithValue(error.response?.data.msg || 'An error occurred'); // Return a value for error handling
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    localStorage.removeItem('jobseek_logged');

    Cookie.remove('jobseek_rfToken');

    thunkAPI.dispatch({ type: 'alert/alert', payload: { success: 'Logout success.' } });

    return {};
  }
);

export const editProfile = createAsyncThunk(
  'auth/editProfile',
  async (profileData: IEditProfileType, thunkAPI) => {
    try {
      thunkAPI.dispatch({ type: 'alert/alert', payload: { loading: true } });

      let avatarUrl = '';
      let cvUrl = '';

      if (profileData.tempAvatar.length > 0) {
        const url = await uploadFile(profileData.tempAvatar, 'avatar');
        avatarUrl = url[0];
      }

      if (profileData.tempCv.length > 0) {
        const url = await uploadFile(profileData.tempCv, 'cv');
        cvUrl = url[0];
      }

      const res = await patchDataAPI(
        'jobseeker',
        {
          ...profileData,
          avatar: avatarUrl ? avatarUrl : profileData.avatar,
          cv: cvUrl ? cvUrl : profileData.cv,
        },
        profileData.token
      );

      thunkAPI.dispatch({ type: 'alert/alert', payload: { success: res.data.msg } });

      return {
        accessToken: profileData.token,
        user: res.data.user,
      };
    } catch (err) {
      const error = err as { response?: { data: { msg: string } } }; // Specify the error type
      thunkAPI.dispatch({ type: 'alert/alert', payload: { error: error.response?.data.msg || 'An error occurred' } });
      return thunkAPI.rejectWithValue(error.response?.data.msg || 'An error occurred'); // Return a value for error handling
    }
  }
);

const initialState: IAuth = {};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled'),
      (_, action) => {
        return action.payload;
      }
    );
  },
});

export default authSlice.reducer;
