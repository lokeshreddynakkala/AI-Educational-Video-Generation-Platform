import React, { useState, useEffect } from 'react'
import { useProject } from '../context/ProjectContext'
import './Dashboard.css'

export default function Dashboard() {
  const { projects, setCurrentProject, loading } = useProject()
  const [filter, setFilter] = useState('all')

  const filteredProjects = projects.filter(p => {
    if (filter === 'completed') return p.stages.video !== null
    if (filter === 'in-progress') return p.stages.video === null && p.stages.script !== null
    return true
  })

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Projects</h1>
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'in-progress' ? 'active' : ''} 
            onClick={() => setFilter('in-progress')}
          >
            In Progress
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <p>No projects found</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(project => (
            <div 
              key={project.id} 
              className="project-card"
              onClick={() => setCurrentProject(project)}
            >
              <h2>{project.name}</h2>
              <p className="project-topic">{project.topic}</p>
              
              <div className="project-stages">
                <div className={`stage ${project.stages.script ? 'done' : 'pending'}`}>
                  <span>Script</span>
                </div>
                <div className={`stage ${project.stages.slides ? 'done' : 'pending'}`}>
                  <span>Slides</span>
                </div>
                <div className={`stage ${project.stages.voice ? 'done' : 'pending'}`}>
                  <span>Voice</span>
                </div>
                <div className={`stage ${project.stages.video ? 'done' : 'pending'}`}>
                  <span>Video</span>
                </div>
              </div>

              <p className="project-date">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
