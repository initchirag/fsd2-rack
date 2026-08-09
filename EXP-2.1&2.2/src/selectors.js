import { createSelector } from '@reduxjs/toolkit'
import { postsSelectors } from './features/postsSlice.js'

export const selectPlatforms = (state) => state.platforms.platforms
export const selectActivePlatformId = (state) => state.platforms.activePlatformId
export const selectPostsStatus = (state) => state.posts.status

export const selectActivePlatform = createSelector(
  [selectPlatforms, selectActivePlatformId],
  (platforms, activePlatformId) =>
    platforms.find((platform) => platform.id === activePlatformId) || platforms[0],
)

export const selectVisiblePosts = createSelector(
  [postsSelectors.selectAll, selectActivePlatformId],
  (posts, activePlatformId) =>
    posts.filter((post) => post.platformId === activePlatformId),
)

export const selectDashboardStats = createSelector(
  [postsSelectors.selectAll, selectActivePlatform],
  (posts, activePlatform) => {
    const total = posts.length
    const platformPosts = posts.filter((post) => post.platformId === activePlatform.id)
    const published = posts.filter((post) => post.status === 'published').length
    const averageEngagement = total
      ? Math.round(posts.reduce((sum, post) => sum + post.engagement, 0) / total)
      : 0

    return {
      total,
      published,
      averageEngagement,
      platformPostCount: platformPosts.length,
      platformName: activePlatform.name,
    }
  },
)
