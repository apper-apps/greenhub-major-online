import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { projectService } from '@/services/api/projectService'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import SearchBar from '@/components/molecules/SearchBar'
import StatusBadge from '@/components/molecules/StatusBadge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'

const Projects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    Name: '',
    title: '',
    description: '',
    client_id: '',
    budget: '',
    start_date: '',
    end_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await projectService.getAll()
      // Ensure we have valid data array
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      const errorMessage = err?.message || 'Failed to load projects'
      setError(errorMessage)
      toast.error(errorMessage)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    // Enhanced validation
    if (!formData.title?.trim()) {
      toast.error('Project title is required')
      return
    }
    
    if (!formData.client_id) {
      toast.error('Client ID is required')
      return
    }

    // Validate client_id is a valid number
    const clientId = parseInt(formData.client_id)
    if (isNaN(clientId) || clientId <= 0) {
      toast.error('Client ID must be a valid positive number')
      return
    }

    // Validate budget if provided
    let budgetValue = 0
    if (formData.budget) {
      budgetValue = parseFloat(formData.budget)
      if (isNaN(budgetValue) || budgetValue < 0) {
        toast.error('Budget must be a valid positive number')
        return
      }
    }

    try {
      setIsSubmitting(true)
      
      // Prepare clean data for submission
      const projectData = {
        Name: formData.Name?.trim() || formData.title?.trim(),
        title: formData.title?.trim(),
        description: formData.description?.trim() || '',
        client_id: clientId,
        budget: budgetValue,
        start_date: formData.start_date || '',
        end_date: formData.end_date || '',
        notes: formData.notes?.trim() || ''
      }

      const newProject = await projectService.create(projectData)
      
      if (newProject) {
        setProjects(prev => [newProject, ...prev])
        setShowCreateModal(false)
        resetForm()
        toast.success('Project created successfully')
      }
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create project'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Invalid project ID')
      return
    }

    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectService.delete(id)
      setProjects(prev => prev.filter(p => p.Id !== id))
      toast.success('Project deleted successfully')
      
      // Close detail modal if deleting the currently viewed project
      if (selectedProject?.Id === id) {
        setShowDetailModal(false)
        setSelectedProject(null)
      }
    } catch (err) {
      const errorMessage = err?.message || 'Failed to delete project'
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    setFormData({
      Name: '',
      title: '',
      description: '',
      client_id: '',
      budget: '',
      start_date: '',
      end_date: '',
      notes: ''
    })
  }

  // Safe filtering with proper null checks
  const filteredProjects = projects.filter(project => {
    if (!project) return false
    
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = !searchTerm || 
      (project.title && project.title.toLowerCase().includes(searchLower)) ||
      (project.description && project.description.toLowerCase().includes(searchLower)) ||
      (project.Name && project.Name.toLowerCase().includes(searchLower))
    
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  // Helper functions for safe data display
  const formatCurrency = (value) => {
    if (value == null || value === '') return 'N/A'
    const numValue = parseFloat(value)
    return isNaN(numValue) ? 'N/A' : `$${numValue.toLocaleString()}`
  }

  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A'
    try {
      const date = new Date(dateValue)
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  const getProgress = (progress) => {
    const numProgress = parseFloat(progress)
    if (isNaN(numProgress)) return 0
    return Math.max(0, Math.min(100, numProgress))
  }

  const handleFormFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNumericFieldChange = (field, value, parser = parseFloat) => {
    if (value === '') {
      setFormData(prev => ({ ...prev, [field]: '' }))
    } else {
      const numValue = parser(value)
      if (!isNaN(numValue)) {
        setFormData(prev => ({ ...prev, [field]: numValue }))
      }
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={fetchProjects} />

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage and track your ongoing projects</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <ApperIcon name="Plus" size={16} />
            New Project
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search projects..."
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Empty message="No projects found" />
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map(project => {
            // Ensure project is valid
            if (!project || !project.Id) return null
            
            return (
              <Card key={project.Id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {project.title || project.Name || 'Untitled Project'}
                    </h3>
                    {/* Safe description rendering with proper error handling */}
                    <div className="text-gray-600 mb-4">
                      {typeof project.description === 'string' && project.description.trim() 
                        ? project.description 
                        : 'No description available'
                      }
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Budget:</strong> {formatCurrency(project.budget)}</p>
                        <p><strong>Actual Cost:</strong> {formatCurrency(project.actual_cost)}</p>
                      </div>
                      <div>
                        <p><strong>Start Date:</strong> {formatDate(project.start_date)}</p>
                        <p><strong>End Date:</strong> {formatDate(project.end_date)}</p>
                      </div>
                      <div>
                        <p><strong>Progress:</strong> {getProgress(project.progress)}%</p>
                        <p><strong>Client ID:</strong> {project.client_id || 'N/A'}</p>
                      </div>
                    </div>
                    {project.notes && typeof project.notes === 'string' && project.notes.trim() && (
                      <p className="text-gray-600 mt-4 italic">{project.notes}</p>
                    )}
                    {/* Safe progress bar with proper bounds checking */}
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${getProgress(project.progress)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={project.status || 'planning'} />
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project)
                          setShowDetailModal(true)
                        }}
                      >
                        <ApperIcon name="Eye" size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.Id)}
                      >
                        <ApperIcon name="Trash2" size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Create New Project</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFormFieldChange('title', e.target.value)}
                    required
                    placeholder="Enter project title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID *
                  </label>
                  <Input
                    type="number"
                    value={formData.client_id}
                    onChange={(e) => handleNumericFieldChange('client_id', e.target.value, parseInt)}
                    required
                    placeholder="Enter client ID"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleFormFieldChange('description', e.target.value)}
                    placeholder="Enter project description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleNumericFieldChange('budget', e.target.value)}
                    placeholder="Enter budget amount"
                    min="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleFormFieldChange('start_date', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleFormFieldChange('end_date', e.target.value)}
                    />
                  </div>
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
                    {isSubmitting ? 'Creating...' : 'Create Project'}
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

export default Projects