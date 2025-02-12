import { createSlice } from '@reduxjs/toolkit'
import { IJobseeker } from '../../lib/utils/interface'

const initialState: any = null

interface IAction {
  payload: any
}

const userDescriptionSlice = createSlice({
  name: 'userDescription',
  initialState,
  reducers: {
    open: (state: any, action: IAction) => {
      return action.payload
    }
  }
})

export default userDescriptionSlice.reducer