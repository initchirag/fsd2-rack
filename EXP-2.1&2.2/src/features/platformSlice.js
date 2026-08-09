import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  activePlatformId: 'react',
  platforms: [
    {
      id: 'react',
      name: 'React',
      category: 'UI library',
      status: 'stable',
    },
    {
      id: 'redux',
      name: 'Redux Toolkit',
      category: 'State management',
      status: 'stable',
    },
    {
      id: 'reselect',
      name: 'Reselect',
      category: 'Memoized selectors',
      status: 'stable',
    },
  ],
}

const platformSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    setActivePlatform(state, action) {
      state.activePlatformId = action.payload
    },
  },
})

export const { setActivePlatform } = platformSlice.actions
export const platformReducer = platformSlice.reducer
