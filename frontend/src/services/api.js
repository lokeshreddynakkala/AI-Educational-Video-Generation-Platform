import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Script endpoints
export const scriptAPI = {
  generate: (data) => api.post('/script/generate', data),
  getScript: (scriptId) => api.get(`/script/scripts/${scriptId}`),
  updateScript: (scriptId, data) => api.put(`/script/scripts/${scriptId}`, data),
  deleteScript: (scriptId) => api.delete(`/script/scripts/${scriptId}`)
}

// Slides endpoints
export const slidesAPI = {
  generate: (data) => api.post('/slides/generate', data),
  getSlides: (slidesId) => api.get(`/slides/slides/${slidesId}`),
  updateSlides: (slidesId, data) => api.put(`/slides/slides/${slidesId}`, data),
  deleteSlides: (slidesId) => api.delete(`/slides/slides/${slidesId}`)
}

// Voice endpoints
export const voiceAPI = {
  generate: (data) => api.post('/voice/generate', data),
  getVoice: (voiceId) => api.get(`/voice/voice/${voiceId}`),
  updateVoice: (voiceId, data) => api.put(`/voice/voice/${voiceId}`, data),
  deleteVoice: (voiceId) => api.delete(`/voice/voice/${voiceId}`)
}

// Video endpoints
export const videoAPI = {
  generate: (data) => api.post('/video/generate', data),
  getVideo: (videoId) => api.get(`/video/video/${videoId}`),
  getVideoStatus: (videoId) => api.get(`/video/video/${videoId}/status`),
  deleteVideo: (videoId) => api.delete(`/video/video/${videoId}`)
}

// Subtitle endpoints
export const subtitleAPI = {
  generate: (data) => api.post('/subtitle/generate', data),
  getSubtitle: (subtitleId) => api.get(`/subtitle/subtitle/${subtitleId}`),
  updateSubtitle: (subtitleId, data) => api.put(`/subtitle/subtitle/${subtitleId}`, data),
  deleteSubtitle: (subtitleId) => api.delete(`/subtitle/subtitle/${subtitleId}`)
}

// Health check
export const healthAPI = {
  check: () => api.get('/health')
}

export default api
