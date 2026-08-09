import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.engagement - a.engagement,
})

const initialPosts = [
  {
    id: 'post-1',
    title: 'Centralized state in Redux Toolkit',
    platformId: 'redux',
    status: 'published',
    engagement: 82,
  },
  {
    id: 'post-2',
    title: 'Memoized selectors with Reselect',
    platformId: 'reselect',
    status: 'scheduled',
    engagement: 61,
  },
  {
    id: 'post-3',
    title: 'Reusable UI with React components',
    platformId: 'react',
    status: 'draft',
    engagement: 48,
  },
]

export const loadPosts = createAsyncThunk('posts/loadPosts', async () => {
  await new Promise((resolve) => setTimeout(resolve, 450))
  return initialPosts
})

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState({
    status: 'idle',
    error: null,
  }),
  reducers: {
    postAdded: postsAdapter.addOne,
    postStatusChanged(state, action) {
      const { id, status } = action.payload
      const post = state.entities[id]
      if (post) {
        post.status = status
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPosts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        postsAdapter.setAll(state, action.payload)
        state.status = 'succeeded'
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to load posts'
      })
  },
})

export const { postAdded, postStatusChanged } = postsSlice.actions
export const postsReducer = postsSlice.reducer
export const postsSelectors = postsAdapter.getSelectors((state) => state.posts)
