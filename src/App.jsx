import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Layout from '@/components/organisms/Layout'
import Dashboard from '@/components/pages/Dashboard'
import Clients from '@/components/pages/Clients'
import Projects from '@/components/pages/Projects'
import Schedule from '@/components/pages/Schedule'
import Invoices from '@/components/pages/Invoices'
import Proposals from '@/components/pages/Proposals'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="projects" element={<Projects />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="proposals" element={<Proposals />} />
        </Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default App