import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import './StepSetup.css'

export default function StepSetup({ onNext }) {
  const { currentProject } = useProject()
  const [settings, setSettings] = useState({
    videoResolution: '1080p',
    videoFormat: 'mp4',
    fps: 30,
    includeSubtitles: true
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleNext = () => {
    onNext(settings)
  }

  return (
    <div className="step-setup">
      <h2>Setup</h2>
      <p className="step-description">Configure your video output settings</p>

      <form className="setup-form">
        <div className="form-group">
          <label htmlFor="videoResolution">Video Resolution</label>
          <select 
            id="videoResolution"
            name="videoResolution"
            value={settings.videoResolution}
            onChange={handleChange}
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p (Recommended)</option>
            <option value="2k">2K</option>
            <option value="4k">4K</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="videoFormat">Video Format</label>
          <select 
            id="videoFormat"
            name="videoFormat"
            value={settings.videoFormat}
            onChange={handleChange}
          >
            <option value="mp4">MP4 (Recommended)</option>
            <option value="webm">WebM</option>
            <option value="mov">MOV</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fps">Frame Rate (FPS)</label>
          <select 
            id="fps"
            name="fps"
            value={settings.fps}
            onChange={handleChange}
          >
            <option value="24">24 FPS</option>
            <option value="30">30 FPS (Recommended)</option>
            <option value="60">60 FPS</option>
          </select>
        </div>

        <div className="form-group checkbox">
          <input
            type="checkbox"
            id="includeSubtitles"
            name="includeSubtitles"
            checked={settings.includeSubtitles}
            onChange={handleChange}
          />
          <label htmlFor="includeSubtitles">Include Subtitles</label>
        </div>

        <button type="button" className="btn-primary" onClick={handleNext}>
          Next: Script Generation
        </button>
      </form>
    </div>
  )
}
