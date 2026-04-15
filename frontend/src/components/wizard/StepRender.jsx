import React, { useState, useEffect } from 'react'
import { useProject } from '../../context/ProjectContext'
import { videoAPI, subtitleAPI } from '../../services/api'
import './StepRender.css'

export default function StepRender({ onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [renderProgress, setRenderProgress] = useState(0)
  const [isRendering, setIsRendering] = useState(false)
  const [videoUrl, setVideoUrl] = useState(currentProject?.stages?.video?.videoUrl || null)
  const [status, setStatus] = useState('ready') // ready, rendering, completed, error

  useEffect(() => {
    // Poll video status if rendering
    if (status === 'rendering' && currentProject?.stages?.video?.id) {
      const interval = setInterval(async () => {
        try {
          const response = await videoAPI.getVideo(currentProject.stages.video.id)
          // Simulate progress increase
          setRenderProgress(prev => Math.min(prev + 10, 90))
          if (response.data.status === 'completed') {
            setVideoUrl(`http://localhost:8000/${response.data.file_path}`)
            setRenderProgress(100)
            setStatus('completed')
            clearInterval(interval)
          }
        } catch (err) {
          console.error('Error checking status:', err)
        }
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [status, currentProject])

  const handleStartRender = async () => {
    setIsRendering(true)
    setStatus('rendering')
    setLoading(true)
    try {
      // Generate video
      const response = await videoAPI.generate({
        voice_id: currentProject.stages.voice?.id,
        slides_id: currentProject.stages.slides?.id,
        add_subtitles: currentProject.settings?.includeSubtitles || false
      })

      updateStage(currentProject.id, 'video', {
        id: response.data.video_id,
        filePath: response.data.file_path,
        fileName: response.data.file_name,
        duration: response.data.duration_secs,
        status: response.data.status
      })

      setStatus('rendering')
    } catch (err) {
      setError(err.message)
      setStatus('error')
      console.error('Render error:', err)
    } finally {
      setIsRendering(false)
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (currentProject.stages.video?.fileName) {
      // Use the download endpoint
      const downloadUrl = videoAPI.downloadVideo(currentProject.stages.video.fileName)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = currentProject.stages.video.fileName
      a.click()
    }
  }

  return (
    <div className="step-render">
      <h2>Render Video</h2>
      <p className="step-description">Generate your final video</p>

      {status === 'ready' && (
        <div className="render-ready">
          <div className="project-summary">
            <h3>Project Summary</h3>
            <ul>
              <li><strong>Name:</strong> {currentProject.name}</li>
              <li><strong>Topic:</strong> {currentProject.topic}</li>
              <li><strong>Duration:</strong> {currentProject.duration}s</li>
              <li><strong>Slides:</strong> {currentProject.stages.slides?.totalSlides || 0}</li>
            </ul>
          </div>

          <button 
            className="btn-primary btn-large" 
            onClick={handleStartRender}
            disabled={isRendering}
          >
            {isRendering ? 'Starting Render...' : 'Start Rendering'}
          </button>
        </div>
      )}

      {status === 'rendering' && (
        <div className="render-progress">
          <h3>Rendering in Progress...</h3>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${renderProgress}%` }} />
          </div>
          <p className="progress-text">{renderProgress}%</p>
          <p className="status-message">This may take several minutes. Please wait...</p>
        </div>
      )}

      {status === 'completed' && videoUrl && (
        <div className="render-complete">
          <h3>Video Ready!</h3>
          <div className="video-preview">
            <video controls src={videoUrl} style={{ maxWidth: '100%' }} />
          </div>
          <button className="btn-primary" onClick={handleDownload}>Download Video</button>
        </div>
      )}

      {status === 'error' && (
        <div className="render-error">
          <h3>Rendering Failed</h3>
          <p>There was an error during rendering. Please try again.</p>
          <button className="btn-primary" onClick={handleStartRender}>Retry</button>
        </div>
      )}

      {status !== 'rendering' && (
        <div className="step-buttons">
          <button className="btn-secondary" onClick={onBack}>Back</button>
        </div>
      )}
    </div>
  )
}
