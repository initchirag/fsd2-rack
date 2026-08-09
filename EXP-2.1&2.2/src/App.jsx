import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadPosts, postAdded, postStatusChanged } from './features/postsSlice.js'
import { setActivePlatform } from './features/platformSlice.js'
import {
  selectActivePlatform,
  selectDashboardStats,
  selectPlatforms,
  selectPostsStatus,
  selectVisiblePosts,
} from './selectors.js'
import './App.css'

const emptyForm = {
  title: '',
  engagement: 50,
}

function App() {
  const dispatch = useDispatch()
  const platforms = useSelector(selectPlatforms)
  const activePlatform = useSelector(selectActivePlatform)
  const stats = useSelector(selectDashboardStats)
  const posts = useSelector(selectVisiblePosts)
  const status = useSelector(selectPostsStatus)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadPosts())
    }
  }, [dispatch, status])

  const objectiveList = useMemo(
    () => [
      'Understand global state management with Redux Toolkit.',
      'Use normalized state for cleaner, scalable data handling.',
      'Use memoized selectors to reduce unnecessary re-renders.',
      'Handle async data flow with a simple mock API thunk.',
    ],
    [],
  )

  const handleAddPost = (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      return
    }

    dispatch(
      postAdded({
        id: crypto.randomUUID(),
        title: form.title.trim(),
        platformId: activePlatform.id,
        status: 'draft',
        engagement: Number(form.engagement),
      }),
    )
    setForm(emptyForm)
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Redux Toolkit + Reselect</p>
        <h1>Simple centralized state demo</h1>
        <p className="lead">
          A reliable React project built to match the screenshot requirements:
          centralized state, normalized data, async loading, memoized selectors,
          and efficient rendering.
        </p>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Aim</h2>
          <p>
            To design and implement a centralized state management system using
            Redux Toolkit for managing posts and platform-related data.
          </p>
          <h3>Objectives</h3>
          <ul>
            {objectiveList.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Implementation</h2>
          <ol>
            <li>Install Redux Toolkit and React Redux.</li>
            <li>Configure the Redux store.</li>
            <li>Create slices for posts and platforms.</li>
            <li>Use selectors for derived state and filtered posts.</li>
            <li>Connect components with hooks.</li>
          </ol>
          <p className="note">COs mapped: CO1-BT1, CO2-BT2, CO3-BT3</p>
        </article>
      </section>

      <section className="workspace">
        <article className="panel">
          <div className="panel-head">
            <h2>Platforms</h2>
            <span className="status-pill">{status === 'loading' ? 'Loading...' : 'Ready'}</span>
          </div>

          <div className="platforms">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                type="button"
                className={platform.id === activePlatform.id ? 'chip active' : 'chip'}
                onClick={() => dispatch(setActivePlatform(platform.id))}
              >
                {platform.name}
              </button>
            ))}
          </div>

          <div className="stats">
            <div>
              <strong>{stats.total}</strong>
              <span>Total posts</span>
            </div>
            <div>
              <strong>{stats.published}</strong>
              <span>Published</span>
            </div>
            <div>
              <strong>{stats.averageEngagement}</strong>
              <span>Avg. engagement</span>
            </div>
            <div>
              <strong>{stats.platformPostCount}</strong>
              <span>{stats.platformName} posts</span>
            </div>
          </div>

          <form className="form" onSubmit={handleAddPost}>
            <label>
              New post title
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Write a post title"
              />
            </label>
            <label>
              Engagement
              <input
                type="number"
                min="0"
                max="100"
                value={form.engagement}
                onChange={(event) => setForm({ ...form, engagement: event.target.value })}
              />
            </label>
            <button type="submit" className="primary">
              Add post to {activePlatform.name}
            </button>
          </form>
        </article>

        <article className="panel">
          <div className="panel-head">
            <h2>Derived posts</h2>
            <span className="subtle">Filtered with Reselect</span>
          </div>

          {posts.length === 0 ? (
            <p className="empty">No posts for this platform yet.</p>
          ) : (
            <ul className="post-list">
              {posts.map((post) => (
                <li key={post.id} className="post-item">
                  <div>
                    <strong>{post.title}</strong>
                    <p>
                      Status: {post.status} | Engagement: {post.engagement}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() =>
                      dispatch(
                        postStatusChanged({
                          id: post.id,
                          status: post.status === 'published' ? 'draft' : 'published',
                        }),
                      )
                    }
                  >
                    Toggle status
                  </button>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="card full">
        <h2>Expected outcome</h2>
        <ul>
          <li>Centralized state management system implemented</li>
          <li>Efficient handling of posts and platform data</li>
          <li>Reduced prop drilling</li>
          <li>Scalable and maintainable state architecture</li>
        </ul>
      </section>
    </main>
  )
}

export default App
