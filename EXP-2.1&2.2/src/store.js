import { configureStore } from '@reduxjs/toolkit'
import { platformReducer } from './features/platformSlice.js'
import { postsReducer } from './features/postsSlice.js'

export const store = configureStore({
  reducer: {
    platforms: platformReducer,
    posts: postsReducer,
  },
})
