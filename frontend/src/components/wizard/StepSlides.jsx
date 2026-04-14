import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import { slidesAPI } from '../../services/api'
import './StepSlides.css'

export default function StepSlides({ onNext, onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [slideCount, setSlideCount] = useState(5)
  const [slides, setSlides] = useState(currentProject?.stages?.slides?.slides || [])
  const [generating, setGenerating] = useState(false)

  const handleGenerateSlides = async () => {
    setGenerating(true)
    setLoading(true)
    try {
      const response = await slidesAPI.generate({
        script_id: currentProject.stages.script?.id,
        slide_count: slideCount,
        style: 'modern'
      })
      setSlides(response.data.slides)
      updateStage(currentProject.id, 'slides', {
        id: response.data.slides_id,
        slides: response.data.slides,
        totalSlides: response.data.total_slides
      })
    } catch (err) {
      setError(err.message)
      console.error('Slides generation error:', err)
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (slides.length === 0) {
      setError('Please generate slides first')
      return
    }
    onNext()
  }

  return (
    <div className="step-slides">
      <h2>Slides Generation</h2>
      <p className="step-description">Generate slides from your script</p>

      <div className="slides-controls">
        <div className="form-group">
          <label htmlFor="slideCount">Number of Slides</label>
          <input
            type="number"
            id="slideCount"
            min="1"
            max="50"
            value={slideCount}
            onChange={(e) => setSlideCount(parseInt(e.target.value))}
          />
        </div>

        <button 
          className="btn-primary" 
          onClick={handleGenerateSlides}
          disabled={generating}
        >
          {generating ? 'Generating...' : 'Generate Slides'}
        </button>
      </div>

      {slides.length > 0 && (
        <div className="slides-preview">
          <h3>Preview ({slides.length} slides)</h3>
          <div className="slides-list">
            {slides.map((slide, index) => (
              <div key={index} className="slide-item">
                <div className="slide-number">{index + 1}</div>
                <div className="slide-content">
                  <h4>{slide.title}</h4>
                  <p>{slide.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="step-buttons">
        <button className="btn-secondary" onClick={onBack}>Back</button>
        <button className="btn-primary" onClick={handleNext}>Next: Voice</button>
      </div>
    </div>
  )
}
