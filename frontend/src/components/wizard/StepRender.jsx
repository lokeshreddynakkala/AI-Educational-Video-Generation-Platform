import React, { useEffect, useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import { API_ORIGIN, videoAPI } from '../../services/api'
import './StepRender.css'

function buildRenderPayload(project) {
  return {
    voice_id: project.stages.voice?.id,
    slides_id: project.stages.slides?.id,
    add_subtitles: project.settings?.includeSubtitles || false,
    project_title: project.name,
    render_mode: project.settings?.mode || 'no-face',
    avatar_profile: {
      presenter_name: project.settings?.avatarPresenterName || 'Ava',
      appearance: project.settings?.avatarAppearance || 'mentor',
      style: project.settings?.avatarStyle || 'friendly',
      voice_type: project.settings?.voiceType || 'clear',
      speaking_pace: project.settings?.speakingPace || 'normal'
    },
    access_control: {
      creator_name: project.settings?.creatorName || project.creatorName || 'Demo Creator',
      creator_role: project.settings?.creatorRole || project.creatorRole || 'teacher',
      institution: project.settings?.institution || project.institution || '',
      access_level: project.settings?.accessLevel || 'private',
      access_code: project.settings?.accessCode || '',
      allow_download: true
    }
  }
}

function updateVideoStage(project, updateStage, updates) {
  updateStage(project.id, 'video', {
    ...(project.stages.video || {}),
    ...updates
  })
}

export default function StepRender({ onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [renderProgress, setRenderProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState(currentProject?.stages?.video?.previewUrl || '')
  const [videoUrl, setVideoUrl] = useState(currentProject?.stages?.video?.videoUrl || '')
  const [status, setStatus] = useState(currentProject?.stages?.video?.status || 'ready')
  const [jobId, setJobId] = useState(currentProject?.stages?.video?.jobId || '')
  const [shareUrl, setShareUrl] = useState(currentProject?.stages?.video?.shareUrl || '')
  const [shareToken, setShareToken] = useState(currentProject?.stages?.video?.shareToken || '')
  const [renderError, setRenderError] = useState('')

  const renderPayload = buildRenderPayload(currentProject)

  useEffect(() => {
    if (!jobId || status !== 'rendering') {
      return undefined
    }

    const interval = setInterval(async () => {
      try {
        const response = await videoAPI.getJob(jobId)
        setRenderProgress(response.data.progress || 0)

        if (response.data.status === 'completed') {
          const finalVideoUrl = `${API_ORIGIN}/${response.data.file_path}`
          setVideoUrl(finalVideoUrl)
          setShareUrl(response.data.share_url || '')
          setShareToken(response.data.share_token || '')
          setStatus('completed')

          updateVideoStage(currentProject, updateStage, {
            id: response.data.video_id,
            jobId,
            videoUrl: finalVideoUrl,
            filePath: response.data.file_path,
            fileName: response.data.file_name,
            status: 'completed',
            shareUrl: response.data.share_url || '',
            shareToken: response.data.share_token || ''
          })
        }

        if (response.data.status === 'failed') {
          setStatus('error')
          const message = response.data.error || 'Rendering failed'
          setRenderError(message)
          setError(message)
        }
      } catch (error) {
        setStatus('error')
        const message = error.response?.data?.detail || error.message || 'Failed to check render job'
        setRenderError(message)
        setError(message)
      }
    }, 2500)

    return () => clearInterval(interval)
  }, [jobId, status, currentProject, updateStage, setError])

  const handleGeneratePreview = async () => {
    setLoading(true)
    try {
      const response = await videoAPI.createPreview(renderPayload)
      const nextPreviewUrl = `${API_ORIGIN}/${response.data.file_path}`
      setPreviewUrl(nextPreviewUrl)
      updateVideoStage(currentProject, updateStage, { previewUrl: nextPreviewUrl })
      setRenderError('')
      setError('')
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Failed to generate preview'
      setRenderError(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleStartRender = async () => {
    setLoading(true)
    setStatus('rendering')
    setRenderError('')
    try {
      const response = await videoAPI.queueRender(renderPayload)
      setJobId(response.data.job_id)
      setRenderProgress(response.data.progress || 5)
      updateVideoStage(currentProject, updateStage, {
        jobId: response.data.job_id,
        status: 'rendering'
      })
    } catch (error) {
      setStatus('error')
      const message = error.response?.data?.detail || error.message || 'Failed to start render job'
      setRenderError(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShareLink = async () => {
    if (!currentProject.stages.video?.id) {
      return
    }

    setLoading(true)
    try {
      const response = await videoAPI.shareVideo({
        video_id: currentProject.stages.video.id,
        creator_name: currentProject.settings?.creatorName || currentProject.creatorName || 'Demo Creator',
        creator_role: currentProject.settings?.creatorRole || currentProject.creatorRole || 'teacher',
        institution: currentProject.settings?.institution || currentProject.institution || '',
        access_level: currentProject.settings?.accessLevel || 'private',
        access_code: currentProject.settings?.accessCode || '',
        allow_download: true
      })

      setShareUrl(response.data.share_url)
      setShareToken(response.data.share_token)
      updateVideoStage(currentProject, updateStage, {
        shareUrl: response.data.share_url,
        shareToken: response.data.share_token
      })
    } catch (error) {
      const message = error.response?.data?.detail || error.message || 'Failed to create share link'
      setRenderError(message)
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (currentProject.stages.video?.fileName) {
      const downloadUrl = videoAPI.downloadVideo(currentProject.stages.video.fileName)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = currentProject.stages.video.fileName
      link.click()
    }
  }

  const modeLabel = currentProject.settings?.mode === 'avatar' ? 'Avatar' : 'No-Face'
  const accessLabel = currentProject.settings?.accessLevel || 'private'

  return (
    <div className="step-render">
      <h2>Preview and Render</h2>
      <p className="step-description">Preview the output first, then send the final video to the render queue.</p>

      <div className="render-ready">
        <div className="project-summary">
          <h3>Project Summary</h3>
          <ul>
            <li><strong>Name:</strong> {currentProject.name}</li>
            <li><strong>Mode:</strong> {modeLabel}</li>
            <li><strong>Creator:</strong> {currentProject.settings?.creatorName || currentProject.creatorName || 'Not set'}</li>
            <li><strong>Role:</strong> {currentProject.settings?.creatorRole || currentProject.creatorRole || 'teacher'}</li>
            <li><strong>Access:</strong> {accessLabel}</li>
            <li><strong>Slides:</strong> {currentProject.stages.slides?.totalSlides || 0}</li>
          </ul>
        </div>

        <div className="render-actions">
          <button className="btn-secondary" onClick={handleGeneratePreview}>
            Generate Preview
          </button>
          <button className="btn-primary" onClick={handleStartRender} disabled={status === 'rendering'}>
            {status === 'rendering' ? 'Render Queued...' : 'Start Final Render'}
          </button>
        </div>
      </div>

      {previewUrl ? (
        <div className="preview-panel">
          <h3>Preview Before Final Render</h3>
          <video controls src={previewUrl} />
        </div>
      ) : null}

      {status === 'rendering' ? (
        <div className="render-progress">
          <h3>Rendering in Queue</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${renderProgress}%` }} />
          </div>
          <p className="progress-text">{renderProgress}%</p>
          <p className="status-message">The job is being processed asynchronously in the background.</p>
        </div>
      ) : null}

      {status === 'completed' && videoUrl ? (
        <div className="render-complete">
          <h3>Video Ready</h3>
          <div className="video-preview">
            <video controls src={videoUrl} />
          </div>

          <div className="render-actions">
            <button className="btn-primary" onClick={handleDownload}>Download Video</button>
            <button className="btn-secondary" onClick={handleCreateShareLink}>Generate Share Link</button>
          </div>

          {shareUrl ? (
            <div className="share-panel">
              <p><strong>Share URL:</strong> <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a></p>
              <p><strong>Share Token:</strong> {shareToken}</p>
              {currentProject.settings?.accessCode ? (
                <p><strong>Access Code:</strong> {currentProject.settings.accessCode}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {status === 'error' ? (
        <div className="render-error">
          <h3>Rendering Failed</h3>
          <p>{renderError || 'Please check the backend logs and try the preview or render action again.'}</p>
        </div>
      ) : null}

      <div className="step-buttons">
        <button className="btn-secondary" onClick={onBack}>Back</button>
      </div>
    </div>
  )
}
