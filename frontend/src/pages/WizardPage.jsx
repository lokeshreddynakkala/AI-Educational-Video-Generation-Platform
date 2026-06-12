import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StepSetup from '../components/wizard/StepSetup'
import StepScript from '../components/wizard/StepScript'
import StepSlides from '../components/wizard/StepSlides'
import StepVoice from '../components/wizard/StepVoice'
import StepRender from '../components/wizard/StepRender'
import { useProject } from '../context/ProjectContext'
import './WizardPage.css'

const steps = [
  { id: 'setup', title: 'Setup' },
  { id: 'script', title: 'Script' },
  { id: 'slides', title: 'Slides' },
  { id: 'voice', title: 'Voice' },
  { id: 'render', title: 'Render' }
]

export default function WizardPage() {
  const navigate = useNavigate()
  const { currentProject, error, setError, updateProject } = useProject()
  const [stepIndex, setStepIndex] = useState(0)

  if (!currentProject) {
    return (
      <div className="wizard-empty">
        <h1>No project selected</h1>
        <p>Create a project first, then come back here to complete each production step.</p>
        <Link className="wizard-link" to="/create">
          Go to Create Project
        </Link>
      </div>
    )
  }

  const handleSetupNext = (settings) => {
    updateProject(currentProject.id, {
      settings,
      creatorName: settings.creatorName,
      creatorRole: settings.creatorRole,
      institution: settings.institution
    })
    setError(null)
    setStepIndex(1)
  }

  const goToStep = (nextIndex) => {
    setError(null)
    setStepIndex(nextIndex)
  }

  const stepContent = [
    <StepSetup key="setup" onNext={handleSetupNext} />,
    <StepScript key="script" onBack={() => goToStep(0)} onNext={() => goToStep(2)} />,
    <StepSlides key="slides" onBack={() => goToStep(1)} onNext={() => goToStep(3)} />,
    <StepVoice key="voice" onBack={() => goToStep(2)} onNext={() => goToStep(4)} />,
    <StepRender key="render" onBack={() => goToStep(3)} />
  ]

  return (
    <div className="wizard-page">
      <header className="wizard-header">
        <div>
          <p className="wizard-kicker">Guided production</p>
          <h1>{currentProject.name}</h1>
          <p className="wizard-topic">{currentProject.topic}</p>
        </div>

        <button className="wizard-secondary-button" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </header>

      <section className="wizard-progress" aria-label="Wizard steps">
        {steps.map((step, index) => {
          const isCurrent = index === stepIndex
          const isComplete = index < stepIndex

          return (
            <button
              key={step.id}
              className={`wizard-step${isCurrent ? ' current' : ''}${isComplete ? ' complete' : ''}`}
              onClick={() => index <= stepIndex && goToStep(index)}
              disabled={index > stepIndex}
            >
              <span>{index + 1}</span>
              {step.title}
            </button>
          )
        })}
      </section>

      {error ? (
        <div className="wizard-alert" role="alert">
          {error}
        </div>
      ) : null}

      <section className="wizard-content">{stepContent[stepIndex]}</section>
    </div>
  )
}
