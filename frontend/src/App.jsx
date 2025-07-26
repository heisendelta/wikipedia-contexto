import { useEffect, useState } from 'react'
import axios from 'axios'

function App() {
  const [msg, setMsg] = useState("")

  useEffect(() => {
    axios.get("http://localhost:8000/hello")
      .then(res => setMsg(res.data.message))
      .catch(console.error)
  }, [])

  return (
    <div>
      <h1>{msg}</h1>
    </div>
  )
}

export default App
