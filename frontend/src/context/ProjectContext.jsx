import React, { createContext, useState } from 'react'

export const ProjectContext = createContext()

const defaultStages = {
  script: null,
  slides: null,
  voice: null,
  video: null,
  subtitle: null
}

function updateMatchingProject(project, projectId, updates) {
  return project.id === projectId ? { ...project, ...updates } : project
}

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function createProject(projectData) {
    const newProject = {
      id: `project_${Date.now()}`,
      createdAt: new Date(),
      creatorName: projectData.creatorName || '',
      creatorRole: projectData.creatorRole || 'teacher',
      institution: projectData.institution || '',
      ...projectData,
      stages: defaultStages
    }
    setProjects((prev) => [newProject, ...prev])
    setCurrentProject(newProject)
    return newProject
  }

  function updateProject(projectId, updates) {
    setProjects((prev) => prev.map((project) => updateMatchingProject(project, projectId, updates)))
    setCurrentProject((prev) => (prev?.id === projectId ? { ...prev, ...updates } : prev))
  }

  function updateStage(projectId, stageName, stageData) {
    const stageUpdate = (project) => ({
      ...project,
      stages: { ...project.stages, [stageName]: stageData }
    })

    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? stageUpdate(project) : project))
    )
    setCurrentProject((prev) => (prev?.id === projectId ? stageUpdate(prev) : prev))
  }

  function deleteProject(projectId) {
    setProjects((prev) => prev.filter((project) => project.id !== projectId))
    setCurrentProject((prev) => (prev?.id === projectId ? null : prev))
  }

  const value = {
    projects,
    currentProject,
    setCurrentProject,
    loading,
    setLoading,
    error,
    setError,
    createProject,
    updateProject,
    updateStage,
    deleteProject
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = React.useContext(ProjectContext)
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider')
  }
  return context
}
