import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import StatCard from '@/components/molecules/StatCard'
import Card from '@/components/atoms/Card'
import Button from '@/components/atoms/Button'
import StatusBadge from '@/components/molecules/StatusBadge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import ApperIcon from '@/components/ApperIcon'
import { clientService } from '@/services/api/clientService'
import { projectService } from '@/services/api/projectService'
import { invoiceService } from '@/services/api/invoiceService'
import { appointmentService } from '@/services/api/appointmentService'

const Dashboard = () => {
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [invoices, setInvoices] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      const [clientsData, projectsData, invoicesData, appointmentsData] = await Promise.all([
        clientService.getAll(),
        projectService.getAll(),
        invoiceService.getAll(),
        appointmentService.getAll()
      ])
      
      setClients(clientsData)
      setProjects(projectsData)
      setInvoices(invoicesData)
      setAppointments(appointmentsData)
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  if (loading) return <Loading type="stats" />
  if (error) return <Error message={error} onRetry={loadDashboardData} />

  // Calculate statistics
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
  const activeProjects = projects.filter(p => p.status === 'in-progress').length
  const totalClients = clients.length
  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length

  // Get upcoming appointments
  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= new Date() && apt.status === 'scheduled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  // Get recent projects
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
        </div>
        <Button variant="primary" icon="Plus">
          Quick Actions
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon="DollarSign"
          color="success"
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon="FolderOpen"
          color="primary"
          trend="up"
          trendValue="+3"
        />
        <StatCard
          title="Total Clients"
          value={totalClients}
          icon="Users"
          color="accent"
          trend="up"
          trendValue="+2"
        />
        <StatCard
          title="Pending Invoices"
          value={pendingInvoices}
          icon="FileText"
          color="warning"
          trend="down"
          trendValue="-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
            <Button variant="ghost" size="sm" icon="Calendar">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <motion.div
                  key={appointment.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="Calendar" className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                      <p className="text-sm text-gray-600">
                        {format(new Date(appointment.date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={appointment.status} />
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Recent Projects */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
            <Button variant="ghost" size="sm" icon="FolderOpen">
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent projects</p>
            ) : (
              recentProjects.map((project) => (
                <motion.div
                  key={project.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <ApperIcon name="Hammer" className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{project.title}</h4>
                      <p className="text-sm text-gray-600">
                        Budget: ${project.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={project.status} />
                    <p className="text-sm text-gray-600 mt-1">{project.progress}%</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button variant="outline" className="flex flex-col items-center gap-2 h-24">
            <ApperIcon name="UserPlus" className="w-6 h-6" />
            <span>Add Client</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center gap-2 h-24">
            <ApperIcon name="FolderPlus" className="w-6 h-6" />
            <span>New Project</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center gap-2 h-24">
            <ApperIcon name="FileText" className="w-6 h-6" />
            <span>Create Invoice</span>
          </Button>
          <Button variant="outline" className="flex flex-col items-center gap-2 h-24">
            <ApperIcon name="Calendar" className="w-6 h-6" />
            <span>Schedule Meeting</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard