import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import { voiceAPI } from '../../services/api'
import './StepVoice.css'

export default function StepVoice({ onNext, onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [generating, setGenerating] = useState(false)
  const [audioFiles, setAudioFiles] = useState(currentProject?.stages?.voice?.audioFiles || [])

  const handleGenerateVoice = async () => {
    setGenerating(true)
    setLoading(true)
    try {
      const segments = (currentProject.stages.script?.segments || []).map((text, index) => ({
        slide_number: index + 1,
        text: text
      }))
      
      const response = await voiceAPI.generate({
        segments: segments,
        language: currentProject.language || 'English'
      })
      
      setAudioFiles(response.data.audio_files)
      updateStage(currentProject.id, 'voice', {
        id: response.data.voice_id,
        audioFiles: response.data.audio_files,
        totalSegments: response.data.total_segments
      })
    } catch (err) {
      setError(err.message || 'Failed to generate voice')
      console.error('Voice generation error:', err)
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (audioFiles.length === 0) {
      setError('Please generate voice audio first')
      return
    }
    onNext()
  }

  return (
    <div className="step-voice">
      <h2>Voice Generation</h2>
      <p className="step-description">Generate voice audio for your video</p>

      <div className="voice-controls">
        <button 
          className="btn-primary" 
          onClick={handleGenerateVoice}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Voice'}
        </button>
      </div>

      {audioFiles.length > 0 && (
        <div className="audio-preview">
          <h3>Audio Segments Created ({audioFiles.length})</h3>
          <div className="audio-list">
            {audioFiles.map((file, index) => (
              <div key={index} className="audio-item">
                <div className="audio-info">
                  <span>Slide {file.slide_number}</span>
                  <span>{file.file_name}</span>
                </div>
                <audio controls src={`http://localhost:8000/${file.file_path}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-buttons">
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={handleNext}>Next: Render</button>
      </div>
    </div>
  )
}
