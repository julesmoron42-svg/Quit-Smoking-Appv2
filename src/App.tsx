import { useState } from 'react'
import cigaretteLogo from '../assets/cigarette-logo.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={cigaretteLogo} className="logo" alt="Cigarette logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={cigaretteLogo} className="logo react" alt="Cigarette logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the cigarette logos to learn more
      </p>
    </>
  )
}

export default App
