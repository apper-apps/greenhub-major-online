import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { appointmentService } from '@/services/api/appointmentService'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import SearchBar from '@/components/molecules/SearchBar'
import StatusBadge from '@/components/molecules/StatusBadge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'

const Schedule = () => {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedAppointment, setSelectedAppointment] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    title: '',
    type: '',
    date: '',
    duration: '',
    assigned_crew: '',
    location: '',
    notes: ''
  })

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const data = await appointmentService.getAll()
      setAppointments(data)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.client_id || !formData.date) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      const newAppointment = await appointmentService.create(formData)
      setAppointments(prev => [newAppointment, ...prev])
      setShowCreateModal(false)
      resetForm()
      toast.success('Appointment created successfully')
    } catch (err) {
      toast.error('Failed to create appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return

    try {
      await appointmentService.delete(id)
      setAppointments(prev => prev.filter(a => a.Id !== id))
      toast.success('Appointment deleted successfully')
      if (selectedAppointment?.Id === id) {
        setShowDetailModal(false)
        setSelectedAppointment(null)
      }
    } catch (err) {
      toast.error('Failed to delete appointment')
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      const updated = await appointmentService.updateStatus(id, status)
      setAppointments(prev => prev.map(a => a.Id === id ? updated : a))
      if (selectedAppointment?.Id === id) {
        setSelectedAppointment(updated)
      }
      toast.success(`Appointment ${status} successfully`)
    } catch (err) {
      toast.error('Failed to update appointment status')
    }
  }

  const resetForm = () => {
    setFormData({
      client_id: '',
      project_id: '',
      title: '',
      type: '',
      date: '',
      duration: '',
      assigned_crew: '',
      location: '',
      notes: ''
    })
  }

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.location?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || appointment.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={fetchAppointments} />

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600">Manage appointments and scheduling</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <ApperIcon name="Plus" size={16} />
            Schedule Appointment
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search appointments..."
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <Empty message="No appointments found" />
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map(appointment => (
            <Card key={appointment.Id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {appointment.title}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Date:</strong> {new Date(appointment.date).toLocaleString()}</p>
                      <p><strong>Duration:</strong> {appointment.duration} minutes</p>
                      <p><strong>Type:</strong> {appointment.type}</p>
                    </div>
                    <div>
                      <p><strong>Location:</strong> {appointment.location}</p>
                      <p><strong>Assigned Crew:</strong> {appointment.assigned_crew}</p>
                    </div>
                  </div>
                  {appointment.notes && (
                    <p className="text-gray-600 mt-2">{appointment.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={appointment.status} />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAppointment(appointment)
                        setShowDetailModal(true)
                      }}
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(appointment.Id)}
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Schedule New Appointment</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID *
                  </label>
                  <Input
                    type="number"
                    value={formData.client_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, client_id: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time *
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Schedule Appointment'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Schedule