import axios from 'axios'

const fallbackHost =
  window.location.hostname === '127.0.0.1' ? '127.0.0.1' : 'localhost'
export const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || `http://${fallbackHost}:8000`
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${API_ORIGIN}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// One shared axios client keeps the API code simple for every step.
export const scriptAPI = {
  generate: (data) => api.post('/script/generate', data)
}

export const slidesAPI = {
  generate: (data) => api.post('/slides/generate', data)
}

export const voiceAPI = {
  generate: (data) => api.post('/voice/synthesize-all', data)
}

export const videoAPI = {
  generate: (data) => api.post('/video/generate', data),
  createPreview: (data) => api.post('/video/preview', data),
  queueRender: (data) => api.post('/video/jobs', data),
  getJob: (jobId) => api.get(`/video/jobs/${jobId}`),
  getVideo: (videoId) => api.get(`/video/video/${videoId}`),
  shareVideo: (data) => api.post('/video/share', data),
  getLibrary: () => api.get('/video/library'),
  getSharedVideo: (token, accessCode = '') =>
    api.get(`/video/share/${token}`, { params: { access_code: accessCode } }),
  downloadVideo: (filename) => `${API_BASE_URL}/video/download/${filename}`,
  downloadSharedVideo: (token, accessCode = '') =>
    `${API_BASE_URL}/video/share/${token}/download?access_code=${encodeURIComponent(accessCode)}`
}

export default api
