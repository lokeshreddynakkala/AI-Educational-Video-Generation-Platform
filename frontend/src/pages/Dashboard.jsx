import { useNavigate } from 'react-router-dom'
import { useProject } from '../context/ProjectContext'
import './Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { projects, setCurrentProject, loading } = useProject()

  const handleOpenProject = (project) => {
    setCurrentProject(project)
    navigate('/wizard')
  }

  const completedCount = projects.filter((project) => project.stages.video !== null).length
  const activeCount = projects.filter(
    (project) => project.stages.video === null && project.stages.script !== null
  ).length

  return (
    <div className="dashboard">
      <section className="dashboard-hero">
        <div>
          <p className="hero-kicker">Workspace overview</p>
          <h2>Build lesson videos without losing the thread</h2>
          <p className="hero-copy">
            Start a new project, return to drafts, and keep each production step easy to follow.
          </p>
        </div>

        <button className="hero-action" onClick={() => navigate('/create')}>
          Create New Video
        </button>
      </section>

      <section className="stats-grid" aria-label="Project statistics">
        <article className="stat-card">
          <span>Total projects</span>
          <strong>{projects.length}</strong>
        </article>
        <article className="stat-card">
          <span>In progress</span>
          <strong>{activeCount}</strong>
        </article>
        <article className="stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </article>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Recent work</p>
            <h1>Projects</h1>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-panel">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="dashboard-panel empty-state">
            <h3>No projects yet</h3>
            <p>Create your first video project to begin the guided workflow.</p>
            <button className="secondary-action" onClick={() => navigate('/create')}>
              Start a Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => {
              const completedStages = Object.values(project.stages).filter(Boolean).length

              return (
                <article
                  key={project.id}
                  className="project-card"
                  onClick={() => handleOpenProject(project)}
                >
                  <div className="project-card-top">
                    <div>
                      <h2>{project.name}</h2>
                      <p className="project-topic">{project.topic}</p>
                    </div>
                    <span className="project-badge">{completedStages}/5 steps</span>
                  </div>

                  <div className="project-stages">
                    <div className={`stage ${project.stages.script ? 'done' : 'pending'}`}>Script</div>
                    <div className={`stage ${project.stages.slides ? 'done' : 'pending'}`}>Slides</div>
                    <div className={`stage ${project.stages.voice ? 'done' : 'pending'}`}>Voice</div>
                    <div className={`stage ${project.stages.video ? 'done' : 'pending'}`}>Render</div>
                  </div>

                  <p className="project-date">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
