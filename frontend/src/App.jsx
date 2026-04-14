import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchMessage()
  }, [])

  const fetchMessage = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:8000/api/hello')
      setMessage(response.data.message)
    } catch (error) {
      setMessage('Error connecting to backend')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='App'>
      <h1>Project B10</h1>
      <p>{loading ? 'Loading...' : message}</p>
      <button onClick={fetchMessage}>Refresh</button>
    </div>
  )
}

export default App
