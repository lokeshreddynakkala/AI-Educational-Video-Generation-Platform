import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import { voiceAPI } from '../../services/api'
import './StepVoice.css'

export default function StepVoice({ onNext, onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [voiceSettings, setVoiceSettings] = useState({
    voiceId: 'default',
    speed: 1.0,
    pitch: 1.0
  })
  const [generating, setGenerating] = useState(false)
  const [audioUrl, setAudioUrl] = useState(currentProject?.stages?.voice?.audioUrl || null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setVoiceSettings(prev => ({
      ...prev,
      [name]: name === 'voiceId' ? value : parseFloat(value)
    }))
  }

  const handleGenerateVoice = async () => {
    setGenerating(true)
    setLoading(true)
    try {
      const response = await voiceAPI.generate({
        script_id: currentProject.stages.script?.id,
        voice_id: voiceSettings.voiceId,
        speed: voiceSettings.speed,
        pitch: voiceSettings.pitch
      })
      setAudioUrl(response.data.audio_url)
      updateStage(currentProject.id, 'voice', {
        id: response.data.voice_id,
        audioUrl: response.data.audio_url,
        duration: response.data.duration
      })
    } catch (err) {
      setError(err.message)
      console.error('Voice generation error:', err)
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!audioUrl) {
      setError('Please generate voice audio first')
      return
    }
    onNext()
  }

  return (
    <div className="step-voice">
      <h2>Voice Generation</h2>
      <p className="step-description">Generate voice audio for your video</p>

      <div className="voice-settings">
        <div className="form-group">
          <label htmlFor="voiceId">Voice Selection</label>
          <select 
            id="voiceId"
            name="voiceId"
            value={voiceSettings.voiceId}
            onChange={handleChange}
          >
            <option value="default">Default (Male)</option>
            <option value="female">Female</option>
            <option value="child">Child</option>
            <option value="narrator">Narrator</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="speed">
            Speech Speed: {voiceSettings.speed.toFixed(1)}x
          </label>
          <input
            type="range"
            id="speed"
            name="speed"
            min="0.5"
            max="2.0"
            step="0.1"
            value={voiceSettings.speed}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="pitch">
            Pitch: {voiceSettings.pitch.toFixed(1)}
          </label>
          <input
            type="range"
            id="pitch"
            name="pitch"
            min="0.5"
            max="2.0"
            step="0.1"
            value={voiceSettings.pitch}
            onChange={handleChange}
          />
        </div>

        <button 
          className="btn-primary" 
          onClick={handleGenerateVoice}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Voice'}
        </button>
      </div>

      {audioUrl && (
        <div className="audio-preview">
          <h3>Preview</h3>
          <audio controls src={audioUrl} />
        </div>
      )}

      <div className="step-buttons">
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={handleNext}>Next: Render</button>
      </div>
    </div>
  )
}
