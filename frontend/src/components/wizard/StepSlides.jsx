import React, { useState } from 'react'
import { useProject } from '../../context/ProjectContext'
import { slidesAPI } from '../../services/api'
import './StepSlides.css'

const DEFAULT_MANUAL_SLIDES = 3

function createEmptySlide(index) {
  return {
    slide_number: index + 1,
    title: '',
    text: ''
  }
}

function buildSyncSlides(scriptSegments) {
  return scriptSegments.map((segment, index) => ({
    slide_number: segment.slide_number || index + 1,
    scriptText: segment.content || segment.text || '',
    title: `Slide ${index + 1}`,
    text: segment.content || segment.text || ''
  }))
}

function buildManualSlides(savedSlides) {
  if (savedSlides?.length) {
    return savedSlides.map((slide, index) => ({
      slide_number: index + 1,
      title: slide.title || '',
      text: slide.description || ''
    }))
  }

  return Array.from({ length: DEFAULT_MANUAL_SLIDES }, (_, index) => createEmptySlide(index))
}

function buildRequestSlides(slideMode, slideCount, syncSlides, manualSlides) {
  const sourceSlides =
    slideMode === 'generate'
      ? syncSlides.slice(0, slideCount).map((slide, index) => ({
          slide_number: slide.slide_number || index + 1,
          title: slide.title.trim() || `Slide ${index + 1}`,
          text: slide.text.trim() || slide.scriptText.trim()
        }))
      : manualSlides.map((slide, index) => ({
          slide_number: index + 1,
          title: slide.title.trim() || `Slide ${index + 1}`,
          text: slide.text.trim()
        }))

  return sourceSlides.filter((slide) => slide.text)
}

export default function StepSlides({ onNext, onBack }) {
  const { currentProject, updateStage, setLoading, setError } = useProject()
  const [slideCount, setSlideCount] = useState(5)
  const [slideMode, setSlideMode] = useState('generate')
  const [slides, setSlides] = useState(currentProject?.stages?.slides?.slides || [])
  const [generating, setGenerating] = useState(false)
  const scriptSegments = currentProject?.stages?.script?.segments || []
  const [syncSlides, setSyncSlides] = useState(() => buildSyncSlides(scriptSegments))
  const [manualSlides, setManualSlides] = useState(() =>
    buildManualSlides(currentProject?.stages?.slides?.slides)
  )

  const updateManualSlide = (index, field, value) => {
    setManualSlides((prev) =>
      prev.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, [field]: value } : slide
      )
    )
  }

  const updateSyncSlide = (index, field, value) => {
    setSyncSlides((prev) =>
      prev.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, [field]: value } : slide
      )
    )
  }

  const addManualSlide = () => {
    setManualSlides((prev) => [...prev, createEmptySlide(prev.length)])
  }

  const removeManualSlide = (index) => {
    setManualSlides((prev) =>
      prev
        .filter((_, slideIndex) => slideIndex !== index)
        .map((slide, slideIndex) => ({ ...slide, slide_number: slideIndex + 1 }))
    )
  }

  const handleGenerateSlides = async () => {
    setGenerating(true)
    setLoading(true)
    try {
      if (slideMode === 'generate' && scriptSegments.length === 0) {
        setError('Generate the script first so slide content is available.')
        return
      }

      const requestSlides = buildRequestSlides(slideMode, slideCount, syncSlides, manualSlides)

      if (requestSlides.length === 0) {
        setError('Add at least one valid slide before creating the deck.')
        return
      }

      const response = await slidesAPI.generate({
        topic: currentProject.topic,
        script_segments: requestSlides,
        theme: 'modern',
        num_slides: requestSlides.length
      })

      setSlides(response.data.slides || [])
      updateStage(currentProject.id, 'slides', {
        id: response.data.slides_id,
        slides: response.data.slides || [],
        totalSlides: response.data.total_slides || 0,
        fileName: response.data.file_name,
        filePath: response.data.file_path,
        syncMap: requestSlides
      })
      setError('')
      alert('Slides created successfully! PowerPoint file created.')
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to generate slides')
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
      <p className="step-description">
        Choose whether to sync slides from the script or enter slide content yourself.
      </p>

      <div className="slides-mode-toggle" role="tablist" aria-label="Slide creation mode">
        <button
          type="button"
          className={slideMode === 'generate' ? 'active' : ''}
          onClick={() => setSlideMode('generate')}
        >
          Script Sync
        </button>
        <button
          type="button"
          className={slideMode === 'manual' ? 'active' : ''}
          onClick={() => setSlideMode('manual')}
        >
          Enter Slides Manually
        </button>
      </div>

      {slideMode === 'generate' ? (
        <div className="slides-controls sync-layout">
          <div className="form-group">
            <label htmlFor="slideCount">Number of Slides</label>
            <input
              type="number"
              id="slideCount"
              min="1"
              max="50"
              value={slideCount}
              onChange={(e) => setSlideCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <button className="btn-primary" onClick={handleGenerateSlides} disabled={generating}>
            {generating ? 'Generating...' : 'Create From Script'}
          </button>

          <div className="sync-panel">
            <h3>Slide-to-Script Sync</h3>
            <p>Review each script segment and adjust how it maps to the slide deck.</p>

            <div className="sync-list">
              {syncSlides.slice(0, slideCount).map((slide, index) => (
                <div key={index} className="sync-card">
                  <div className="sync-script">
                    <h4>Script Segment {index + 1}</h4>
                    <p>{slide.scriptText || 'No script text available yet.'}</p>
                  </div>

                  <div className="sync-fields">
                    <div className="form-group">
                      <label htmlFor={`sync-title-${index}`}>Slide Title</label>
                      <input
                        id={`sync-title-${index}`}
                        type="text"
                        value={slide.title}
                        onChange={(e) => updateSyncSlide(index, 'title', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`sync-text-${index}`}>Slide Content</label>
                      <textarea
                        id={`sync-text-${index}`}
                        rows="4"
                        value={slide.text}
                        onChange={(e) => updateSyncSlide(index, 'text', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="manual-slides-panel">
          <div className="manual-slides-header">
            <div>
              <h3>Manual Slide Entry</h3>
              <p>Write the title and content for each slide, then create the deck.</p>
            </div>

            <button type="button" className="btn-secondary" onClick={addManualSlide}>
              Add Slide
            </button>
          </div>

          <div className="manual-slides-list">
            {manualSlides.map((slide, index) => (
              <div key={index} className="manual-slide-card">
                <div className="manual-slide-top">
                  <span className="slide-number-badge">Slide {index + 1}</span>
                  {manualSlides.length > 1 ? (
                    <button
                      type="button"
                      className="link-button"
                      onClick={() => removeManualSlide(index)}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="form-group">
                  <label htmlFor={`manual-title-${index}`}>Title</label>
                  <input
                    id={`manual-title-${index}`}
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateManualSlide(index, 'title', e.target.value)}
                    placeholder={`Slide ${index + 1} title`}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`manual-text-${index}`}>Content</label>
                  <textarea
                    id={`manual-text-${index}`}
                    value={slide.text}
                    onChange={(e) => updateManualSlide(index, 'text', e.target.value)}
                    placeholder="Enter the key points or description for this slide"
                    rows="4"
                  />
                </div>
              </div>
            ))}
          </div>

          <button className="btn-primary" onClick={handleGenerateSlides} disabled={generating}>
            {generating ? 'Creating...' : 'Create Slides'}
          </button>
        </div>
      )}

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
