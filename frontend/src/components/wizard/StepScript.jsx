import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import { scriptAPI } from '../../services/api'
import './StepScript.css'

export default function StepScript({ onNext, onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [script, setScript] = useState(currentProject?.stages?.script?.content || '')
  const [generating, setGenerating] = useState(false)

  const handleGenerateScript = async () => {
    setGenerating(true)
    setLoading(true)
    try {
      const response = await scriptAPI.generate({
        topic: currentProject.topic,
        duration: currentProject.duration,
        language: currentProject.language || 'English',
        audience: currentProject.audience || 'General',
        extra_notes: currentProject.extraNotes || ''
      })
      setScript(response.data.content)
      updateStage(currentProject.id, 'script', {
        id: response.data.script_id,
        content: response.data.content,
        wordCount: response.data.word_count,
        segments: response.data.segments
      })
    } catch (err) {
      setError(err.message || 'Failed to generate script')
      console.error('Script generation error:', err)
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!script.trim()) {
      setError('Please generate or enter a script')
      return
    }
    updateStage(currentProject.id, 'script', {
      id: currentProject.stages.script?.id || `script_${Date.now()}`,
      content: script,
      wordCount: script.split(' ').length
    })
    onNext()
  }

  return (
    <div className="step-script">
      <h2>Script Generation</h2>
      <p className="step-description">Generate or edit your video script</p>

      <div className="script-controls">
        <button 
          className="btn-primary" 
          onClick={handleGenerateScript}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Script with AI'}
        </button>
      </div>

      <div className="script-editor">
        <label htmlFor="scriptContent">Script Content</label>
        <textarea
          id="scriptContent"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          placeholder="Enter your script here..."
          rows="10"
        />
        <p className="script-stats">
          Words: {script.split(' ').filter(w => w).length} | 
          Characters: {script.length}
        </p>
      </div>

      <div className="step-buttons">
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={handleNext}>Next: Slides</button>
      </div>
    </div>
  )
}
