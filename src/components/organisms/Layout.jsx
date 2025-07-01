import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/organisms/Sidebar'
import Header from '@/components/organisms/Header'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col">
          <Sidebar isOpen={true} onClose={handleCloseSidebar} />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={handleMenuClick} />
          
          <main className="flex-1 overflow-auto">
            <div className="p-4 lg:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout