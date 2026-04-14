import React, { createContext, useState, useCallback } from 'react'

export const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [currentProject, setCurrentProject] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createProject = useCallback((projectData) => {
    const newProject = {
      id: `project_${Date.now()}`,
      createdAt: new Date(),
      ...projectData,
      stages: {
        script: null,
        slides: null,
        voice: null,
        video: null,
        subtitle: null
      }
    }
    setProjects([newProject, ...projects])
    setCurrentProject(newProject)
    return newProject
  }, [projects])

  const updateProject = useCallback((projectId, updates) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, ...updates } : p
    ))
    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, ...updates })
    }
  }, [projects, currentProject])

  const updateStage = useCallback((projectId, stageName, stageData) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? {
            ...p,
            stages: { ...p.stages, [stageName]: stageData }
          }
        : p
    ))
    if (currentProject?.id === projectId) {
      setCurrentProject({
        ...currentProject,
        stages: { ...currentProject.stages, [stageName]: stageData }
      })
    }
  }, [projects, currentProject])

  const deleteProject = useCallback((projectId) => {
    setProjects(projects.filter(p => p.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
    }
  }, [projects, currentProject])

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
