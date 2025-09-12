import premiumLogo from '/logo_premium.svg'

import './App.css'

function App() {

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={premiumLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>WMS PREMIUM</h1>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
