import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Header from './Header.tsx'
import Stock from './Stock.tsx'
import Exchanges from './Exchanges.tsx'
import Orders from './Orders.tsx'
import Incidents from './Incidents.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/stock',
    element: <Stock />,
  },
  {
    path: '/exchanges',
    element: <Exchanges />,
  },
  {
    path: '/orders',
    element: <Orders />,
  },
  {
    path: '/incidents',
    element: <Incidents />,
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Header />
    <RouterProvider router={router} />
  </StrictMode>,
)
