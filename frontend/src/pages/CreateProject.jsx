import { useState } from 'react'
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
    creatorName: '',
    creatorRole: 'teacher',
    institution: '',
    audience: 'General',
    extraNotes: ''
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formData.name.trim() || !formData.topic.trim()) {
      window.alert('Please fill in the project name and video topic.')
      return
    }

    const newProject = createProject({
      name: formData.name.trim(),
      topic: formData.topic.trim(),
      duration: formData.duration,
      language: formData.language,
      creatorName: formData.creatorName.trim(),
      creatorRole: formData.creatorRole,
      institution: formData.institution.trim(),
      audience: formData.audience.trim(),
      extraNotes: formData.extraNotes.trim()
    })

    setCurrentProject(newProject)
    navigate('/wizard')
  }

  return (
    <div className="create-project">
      <div className="create-project-container">
        <p className="form-kicker">New production</p>
        <h1>Create a video project</h1>
        <p className="subtitle">
          Add the basics here, then walk through each generation step in the wizard.
        </p>

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
              rows="4"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Video Duration</label>
              <select
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
              >
                <option value="short">Short (2 min)</option>
                <option value="medium">Medium (5 min)</option>
                <option value="long">Long (10 min)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
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
              placeholder="e.g., Beginners, students, professionals"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="creatorName">Creator Name</label>
              <input
                type="text"
                id="creatorName"
                name="creatorName"
                value={formData.creatorName}
                onChange={handleChange}
                placeholder="e.g., Priya Sharma"
              />
            </div>

            <div className="form-group">
              <label htmlFor="creatorRole">Creator Role</label>
              <select
                id="creatorRole"
                name="creatorRole"
                value={formData.creatorRole}
                onChange={handleChange}
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="institution">Institution</label>
            <input
              type="text"
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              placeholder="e.g., ABC College"
            />
          </div>

          <div className="form-group">
            <label htmlFor="extraNotes">Additional Notes</label>
            <textarea
              id="extraNotes"
              name="extraNotes"
              value={formData.extraNotes}
              onChange={handleChange}
              placeholder="Any tone, structure, or style instructions..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn-submit">
            Create Project and Open Wizard
          </button>
        </form>
      </div>
    </div>
  )
}
