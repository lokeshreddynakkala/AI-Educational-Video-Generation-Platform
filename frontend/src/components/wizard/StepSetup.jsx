import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import './StepSetup.css'

export default function StepSetup({ onNext }) {
  const { currentProject } = useProject()
  const [settings, setSettings] = useState({
    mode: currentProject?.settings?.mode || 'no-face',
    videoResolution: currentProject?.settings?.videoResolution || '1080p',
    videoFormat: currentProject?.settings?.videoFormat || 'mp4',
    fps: currentProject?.settings?.fps || 30,
    includeSubtitles: currentProject?.settings?.includeSubtitles ?? true,
    creatorName: currentProject?.settings?.creatorName || currentProject?.creatorName || '',
    creatorRole: currentProject?.settings?.creatorRole || currentProject?.creatorRole || 'teacher',
    institution: currentProject?.settings?.institution || currentProject?.institution || '',
    accessLevel: currentProject?.settings?.accessLevel || 'private',
    accessCode: currentProject?.settings?.accessCode || 'campus-demo',
    avatarPresenterName: currentProject?.settings?.avatarPresenterName || 'Ava',
    avatarAppearance: currentProject?.settings?.avatarAppearance || 'mentor',
    avatarStyle: currentProject?.settings?.avatarStyle || 'friendly',
    voiceType: currentProject?.settings?.voiceType || 'clear',
    speakingPace: currentProject?.settings?.speakingPace || 'normal'
  })

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setSettings((prev) => ({
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
      <p className="step-description">Configure the mode, creator info, access rules, and style.</p>

      <form className="setup-form">
        <div className="form-group">
          <label htmlFor="mode">Presentation Mode</label>
          <select id="mode" name="mode" value={settings.mode} onChange={handleChange}>
            <option value="no-face">No-Face Mode</option>
            <option value="avatar">Avatar Mode</option>
          </select>
        </div>

        <div className="setup-grid">
          <div className="form-group">
            <label htmlFor="creatorName">Creator Name</label>
            <input id="creatorName" name="creatorName" value={settings.creatorName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="creatorRole">Creator Role</label>
            <select id="creatorRole" name="creatorRole" value={settings.creatorRole} onChange={handleChange}>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="institution">Institution</label>
          <input id="institution" name="institution" value={settings.institution} onChange={handleChange} />
        </div>

        <div className="setup-grid">
          <div className="form-group">
            <label htmlFor="accessLevel">Access Control</label>
            <select id="accessLevel" name="accessLevel" value={settings.accessLevel} onChange={handleChange}>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="institution-only">Institution Only</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="accessCode">Access Code</label>
            <input id="accessCode" name="accessCode" value={settings.accessCode} onChange={handleChange} />
          </div>
        </div>

        <div className="setup-grid">
          <div className="form-group">
            <label htmlFor="videoResolution">Video Resolution</label>
            <select id="videoResolution" name="videoResolution" value={settings.videoResolution} onChange={handleChange}>
              <option value="720p">720p</option>
              <option value="1080p">1080p</option>
              <option value="2k">2K</option>
              <option value="4k">4K</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="videoFormat">Video Format</label>
            <select id="videoFormat" name="videoFormat" value={settings.videoFormat} onChange={handleChange}>
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="mov">MOV</option>
            </select>
          </div>
        </div>

        <div className="setup-grid">
          <div className="form-group">
            <label htmlFor="fps">Frame Rate (FPS)</label>
            <select id="fps" name="fps" value={settings.fps} onChange={handleChange}>
              <option value="24">24 FPS</option>
              <option value="30">30 FPS</option>
              <option value="60">60 FPS</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="voiceType">Voice Type</label>
            <select id="voiceType" name="voiceType" value={settings.voiceType} onChange={handleChange}>
              <option value="clear">Clear</option>
              <option value="warm">Warm</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>
        </div>

        <div className="setup-grid">
          <div className="form-group">
            <label htmlFor="speakingPace">Speaking Pace</label>
            <select id="speakingPace" name="speakingPace" value={settings.speakingPace} onChange={handleChange}>
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
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
        </div>

        {settings.mode === 'avatar' ? (
          <div className="avatar-panel">
            <h3>Avatar Customization</h3>
            <p>This panel controls the presenter shown in avatar mode.</p>

            <div className="setup-grid">
              <div className="form-group">
                <label htmlFor="avatarPresenterName">Presenter Name</label>
                <input
                  id="avatarPresenterName"
                  name="avatarPresenterName"
                  value={settings.avatarPresenterName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatarAppearance">Appearance</label>
                <select
                  id="avatarAppearance"
                  name="avatarAppearance"
                  value={settings.avatarAppearance}
                  onChange={handleChange}
                >
                  <option value="mentor">Mentor</option>
                  <option value="student-guide">Student Guide</option>
                  <option value="formal-lecturer">Formal Lecturer</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="avatarStyle">Avatar Style</label>
              <select id="avatarStyle" name="avatarStyle" value={settings.avatarStyle} onChange={handleChange}>
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="energetic">Energetic</option>
              </select>
            </div>
          </div>
        ) : null}

        <button type="button" className="btn-primary" onClick={handleNext}>
          Next: Script Generation
        </button>
      </form>
    </div>
  )
}
