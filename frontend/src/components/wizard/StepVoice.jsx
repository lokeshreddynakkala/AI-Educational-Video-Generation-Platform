import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import { API_ORIGIN, voiceAPI } from '../../services/api'
import './StepVoice.css'

function buildVoiceSegments(scriptSegments) {
  return scriptSegments
    .map((segment, index) => ({
      slide_number: segment.slide_number || index + 1,
      text: segment.content || segment.text || ''
    }))
    .filter((segment) => segment.text)
}

export default function StepVoice({ onNext, onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [generating, setGenerating] = useState(false)
  const [audioFiles, setAudioFiles] = useState(currentProject?.stages?.voice?.audioFiles || [])
  const voiceType = currentProject?.settings?.voiceType || 'clear'
  const speakingPace = currentProject?.settings?.speakingPace || 'normal'
  const renderMode = currentProject?.settings?.mode || 'no-face'

  const handleGenerateVoice = async () => {
    setGenerating(true)
    setLoading(true)
    try {
      const segments = buildVoiceSegments(currentProject.stages.script?.segments || [])

      const response = await voiceAPI.generate({
        segments,
        language: currentProject.language || 'English',
        speaker: voiceType,
        pace: speakingPace
      })

      setAudioFiles(response.data.audio_files)
      updateStage(currentProject.id, 'voice', {
        id: response.data.voice_id,
        audioFiles: response.data.audio_files,
        totalSegments: response.data.total_segments,
        voiceType,
        speakingPace
      })
      setError('')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate voice')
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
      <p className="step-description">Generate narration using the selected voice and mode settings.</p>

      <div className="voice-summary">
        <span>Mode: {renderMode === 'avatar' ? 'Avatar' : 'No-Face'}</span>
        <span>Voice: {voiceType}</span>
        <span>Pace: {speakingPace}</span>
      </div>

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
                <audio controls src={`${API_ORIGIN}/${file.file_path}`} />
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
