import { useMemo, useState } from 'react'
import './App.css'

const PLATFORM_RULES = {
  x: {
    label: 'X (Twitter)',
    charLimit: 280,
    maxHashtags: 5,
    maxMedia: 4,
    supportedMedia: ['image', 'video'],
  },
  linkedin: {
    label: 'LinkedIn',
    charLimit: 3000,
    maxHashtags: 10,
    maxMedia: 9,
    supportedMedia: ['image', 'video'],
  },
  instagram: {
    label: 'Instagram',
    charLimit: 2200,
    maxHashtags: 30,
    maxMedia: 10,
    supportedMedia: ['image', 'video'],
    mediaRequired: true,
  },
  facebook: {
    label: 'Facebook',
    charLimit: 63206,
    maxHashtags: 15,
    maxMedia: 10,
    supportedMedia: ['image', 'video'],
  },
}

const STORAGE_KEY = 'multi-platform-post-drafts'

const getMediaCategory = (file) =>
  file.type.startsWith('image/')
    ? 'image'
    : file.type.startsWith('video/')
      ? 'video'
      : 'other'

function App() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [mediaFiles, setMediaFiles] = useState([])
  const [drafts, setDrafts] = useState(() => {
    const rawDrafts = localStorage.getItem(STORAGE_KEY)
    if (!rawDrafts) {
      return []
    }

    try {
      const parsedDrafts = JSON.parse(rawDrafts)
      return Array.isArray(parsedDrafts) ? parsedDrafts : []
    } catch {
      return []
    }
  })
  const [activeDraftId, setActiveDraftId] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isDeletingDraftId, setIsDeletingDraftId] = useState(null)
  const [useMockApi, setUseMockApi] = useState(true)

  const hashtagCount = useMemo(() => {
    const matches = content.match(/#[a-zA-Z0-9_]+/g)
    return matches ? matches.length : 0
  }, [content])

  const validationSummary = useMemo(() => {
    return selectedPlatforms.map((platformId) => {
      const rule = PLATFORM_RULES[platformId]
      const errors = []
      const warnings = []
      const mediaByCategory = mediaFiles.map(getMediaCategory)
      const unsupportedMedia = mediaByCategory.some(
        (category) => !rule.supportedMedia.includes(category),
      )

      if (content.length > rule.charLimit) {
        errors.push(`Character limit exceeded by ${content.length - rule.charLimit}.`)
      } else if (content.length > Math.floor(rule.charLimit * 0.9)) {
        warnings.push(`Approaching limit (${content.length}/${rule.charLimit}).`)
      }

      if (hashtagCount > rule.maxHashtags) {
        errors.push(
          `Hashtag limit exceeded by ${hashtagCount - rule.maxHashtags} (max ${rule.maxHashtags}).`,
        )
      }

      if (mediaFiles.length > rule.maxMedia) {
        errors.push(`Too many media files: ${mediaFiles.length}/${rule.maxMedia}.`)
      }

      if (rule.mediaRequired && mediaFiles.length === 0) {
        errors.push('At least one media file is required for this platform.')
      }

      if (unsupportedMedia) {
        errors.push('One or more media files are not supported for this platform.')
      }

      return { platformId, label: rule.label, errors, warnings }
    })
  }, [content, hashtagCount, mediaFiles, selectedPlatforms])

  const hasValidationErrors = validationSummary.some(
    ({ errors }) => errors.length > 0,
  )

  const canPublish =
    selectedPlatforms.length > 0 &&
    !hasValidationErrors &&
    (content.trim().length > 0 || mediaFiles.length > 0)

  const updateDraftStorage = (nextDrafts) => {
    setDrafts(nextDrafts)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDrafts))
  }

  const resetComposer = () => {
    setContent('')
    setSelectedPlatforms([])
    setMediaFiles([])
    setActiveDraftId(null)
  }

  const saveWithOptionalDelay = (callback) =>
    new Promise((resolve) => {
      const run = () => {
        callback()
        resolve()
      }

      if (useMockApi) {
        setTimeout(run, 700)
      } else {
        run()
      }
    })

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms((current) =>
      current.includes(platformId)
        ? current.filter((id) => id !== platformId)
        : [...current, platformId],
    )
  }

  const handleMediaSelection = (event) => {
    const incomingFiles = Array.from(event.target.files || [])
    if (incomingFiles.length === 0) {
      return
    }

    setMediaFiles((current) => [...current, ...incomingFiles])
    event.target.value = ''
  }

  const handleRemoveMedia = (fileIndex) => {
    setMediaFiles((current) => current.filter((_, index) => index !== fileIndex))
  }

  const buildDraftPayload = () => {
    const trimmedContent = content.trim()
    const firstLine = trimmedContent.split('\n')[0] || ''
    const title = firstLine ? firstLine.slice(0, 40) : 'Untitled Draft'

    return {
      id: activeDraftId || crypto.randomUUID(),
      title,
      content,
      selectedPlatforms,
      mediaFiles: mediaFiles.map((file) => ({
        name: file.name,
        type: file.type,
      })),
      updatedAt: new Date().toISOString(),
    }
  }

  const handleSaveDraft = async () => {
    if (content.trim().length === 0 && mediaFiles.length === 0) {
      setStatusMessage('Add text or media before saving a draft.')
      return
    }

    setIsSavingDraft(true)
    setStatusMessage('Saving draft...')

    const nextDraft = buildDraftPayload()
    const hasExistingDraft = drafts.some((draft) => draft.id === nextDraft.id)

    await saveWithOptionalDelay(() => {
      if (hasExistingDraft) {
        const updatedDrafts = drafts.map((draft) =>
          draft.id === nextDraft.id ? nextDraft : draft,
        )
        updateDraftStorage(updatedDrafts)
      } else {
        updateDraftStorage([nextDraft, ...drafts])
      }
    })

    setActiveDraftId(nextDraft.id)
    setStatusMessage(hasExistingDraft ? 'Draft updated.' : 'Draft saved.')
    setIsSavingDraft(false)
  }

  const handleEditDraft = (draft) => {
    setContent(draft.content)
    setSelectedPlatforms(draft.selectedPlatforms)
    setMediaFiles(
      draft.mediaFiles.map((fileMeta) => ({
        name: fileMeta.name,
        type: fileMeta.type,
      })),
    )
    setActiveDraftId(draft.id)
    setStatusMessage('Draft loaded for editing. Reattach files if needed.')
  }

  const handleDeleteDraft = async (draftId) => {
    setIsDeletingDraftId(draftId)
    setStatusMessage('Deleting draft...')

    await saveWithOptionalDelay(() => {
      const updatedDrafts = drafts.filter((draft) => draft.id !== draftId)
      updateDraftStorage(updatedDrafts)
    })

    if (activeDraftId === draftId) {
      resetComposer()
    }

    setStatusMessage('Draft deleted.')
    setIsDeletingDraftId(null)
  }

  const handlePublish = () => {
    if (!canPublish) {
      setStatusMessage('Resolve validation errors before publishing.')
      return
    }

    setStatusMessage(
      `Post is valid for ${selectedPlatforms.length} platform(s). Ready to publish.`,
    )
  }

  return (
    <main className="page">
      <header className="intro-card">
        <h1>Experiment 1.1.1 + Draft Management</h1>
        <p>
          Dynamic multi-platform post composer with real-time validation and
          frontend draft CRUD.
        </p>
      </header>

      <section className="info-grid">
        <article className="info-card">
          <h2>Aim</h2>
          <p>
            Design a dynamic composer supporting multiple platforms with
            platform-specific validation.
          </p>
          <h3>Objectives</h3>
          <ul>
            <li>Handle multi-platform content constraints</li>
            <li>Implement real-time validation feedback</li>
            <li>Provide responsive and reusable UI components</li>
          </ul>
        </article>
        <article className="info-card">
          <h2>Aim</h2>
          <p>
            Build a draft management system with create, retrieve, update, and
            delete capabilities.
          </p>
          <h3>Objectives</h3>
          <ul>
            <li>Manage draft data in frontend state</li>
            <li>Implement CRUD actions for drafts</li>
            <li>Simulate asynchronous API behavior</li>
          </ul>
        </article>
      </section>

      <section className="app-grid">
        <article className="panel">
          <h2>Post Composer</h2>

          <div className="platform-list">
            {Object.entries(PLATFORM_RULES).map(([platformId, platform]) => (
              <label key={platformId} className="platform-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPlatforms.includes(platformId)}
                  onChange={() => handlePlatformToggle(platformId)}
                />
                <span>{platform.label}</span>
              </label>
            ))}
          </div>

          <label className="field-label" htmlFor="postContent">
            Post content
          </label>
          <textarea
            id="postContent"
            rows="6"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your post here..."
          />

          <div className="meta-row">
            <p>Characters: {content.length}</p>
            <p>Hashtags: {hashtagCount}</p>
            <p>Media items: {mediaFiles.length}</p>
          </div>

          <label className="field-label" htmlFor="mediaInput">
            Attach media
          </label>
          <input
            id="mediaInput"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleMediaSelection}
          />

          {mediaFiles.length > 0 && (
            <ul className="media-list">
              {mediaFiles.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => handleRemoveMedia(index)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="actions">
            <button
              type="button"
              className="primary"
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
            >
              {isSavingDraft ? 'Saving...' : activeDraftId ? 'Update Draft' : 'Save Draft'}
            </button>
            <button type="button" className="secondary" onClick={resetComposer}>
              New Post
            </button>
            <button type="button" className="primary" onClick={handlePublish}>
              Validate for Publish
            </button>
          </div>

          <label className="mock-toggle">
            <input
              type="checkbox"
              checked={useMockApi}
              onChange={(event) => setUseMockApi(event.target.checked)}
            />
            <span>Simulate backend delay (mock API)</span>
          </label>
        </article>

        <article className="panel">
          <h2>Real-time Validation</h2>
          {selectedPlatforms.length === 0 ? (
            <p className="hint">Select at least one platform to see validation.</p>
          ) : (
            <div className="validation-list">
              {validationSummary.map(({ platformId, label, errors, warnings }) => (
                <section key={platformId} className="validation-item">
                  <h3>{label}</h3>
                  {errors.length === 0 && warnings.length === 0 && (
                    <p className="ok">All checks passed.</p>
                  )}
                  {warnings.map((warning) => (
                    <p key={warning} className="warning">
                      {warning}
                    </p>
                  ))}
                  {errors.map((error) => (
                    <p key={error} className="error">
                      {error}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          )}

          <h2>Saved Drafts</h2>
          {drafts.length === 0 ? (
            <p className="hint">No drafts yet.</p>
          ) : (
            <ul className="draft-list">
              {drafts.map((draft) => (
                <li key={draft.id}>
                  <div>
                    <strong>{draft.title}</strong>
                    <p>
                      Platforms: {draft.selectedPlatforms.length} | Updated:{' '}
                      {new Date(draft.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="draft-actions">
                    <button type="button" onClick={() => handleEditDraft(draft)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDraft(draft.id)}
                      disabled={isDeletingDraftId === draft.id}
                    >
                      {isDeletingDraftId === draft.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {statusMessage && <p className="status">{statusMessage}</p>}
          <p className={canPublish ? 'ok publish-state' : 'warning publish-state'}>
            {canPublish
              ? 'Current post meets selected platform constraints.'
              : 'Post is not publish-ready yet.'}
          </p>
        </article>
      </section>
    </main>
  )
}

export default App
