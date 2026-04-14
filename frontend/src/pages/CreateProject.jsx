import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import './CreateProject.css'

export default function CreateProject() {
  const navigate = useNavigate()
  const { createProject, setCurrentProject } = useProject()
  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    duration: 60,
    tone: 'professional',
    targetAudience: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.topic) {
      alert('Please fill in all required fields')
      return
    }

    const newProject = createProject({
      name: formData.name,
      topic: formData.topic,
      duration: formData.duration,
      tone: formData.tone,
      targetAudience: formData.targetAudience
    })

    setCurrentProject(newProject)
    navigate('/wizard')
  }

  return (
    <div className="create-project">
      <div className="create-project-container">
        <h1>Create New Project</h1>
        <p className="subtitle">Start by providing basic information about your video project</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., AI Tutorial Video"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="topic">Video Topic *</label>
            <textarea
              id="topic"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              placeholder="What is your video about?"
              rows="3"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration (seconds)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="30"
                max="600"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tone">Tone</label>
              <select name="tone" value={formData.tone} onChange={handleChange}>
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="targetAudience">Target Audience</label>
            <input
              type="text"
              id="targetAudience"
              name="targetAudience"
              value={formData.targetAudience}
              onChange={handleChange}
              placeholder="e.g., Beginners, Tech enthusiasts"
            />
          </div>

          <button type="submit" className="btn-submit">Create Project & Start Wizard</button>
        </form>
      </div>
    </div>
  )
}
