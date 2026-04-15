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
    duration: 'medium',
    language: 'English',
    audience: 'General',
    extraNotes: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      language: formData.language,
      audience: formData.audience,
      extraNotes: formData.extraNotes
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
            <div className="form-group">Video Duration</label>
              <select name="duration" value={formData.duration} onChange={handleChange}>
                <option value="short">Short (2 min)</option>
                <option value="medium">Medium (5 min)</option>
                <option value="long">Long (10 min)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select name="language" value={formData.language} onChange={handleChange}>
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="audience">Target Audience</label>
            <input
              type="text"
              id="audience"
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              placeholder="e.g., Beginners, Tech enthusiasts"
            />
          </div>

          <div className="form-group">
            <label htmlFor="extraNotes">Additional Notes (optional)</label>
            <textarea
              id="extraNotes"
              name="extraNotes"
              value={formData.extraNotes}
              onChange={handleChange}
              placeholder="Any specific requirements or instructions..."
              rows="2
              placeholder="e.g., Beginners, Tech enthusiasts"
            />
          </div>

          <button type="submit" className="btn-submit">Create Project & Start Wizard</button>
        </form>
      </div>
    </div>
  )
}
