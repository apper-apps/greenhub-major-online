import React, { useState, useEffect, Component } from 'react'
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

// Error Boundary Component to catch and handle component crashes
class ProjectsErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Projects component error:', error, errorInfo)
    toast.error('An unexpected error occurred. Please refresh the page.')
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Error 
            title="Component Error"
            message="Something went wrong with the Projects component. Please refresh the page to continue."
            onRetry={() => window.location.reload()}
          />
        </div>
      )
    }

    return this.props.children
  }
}

// Data normalization utilities to handle both mock data and database field formats
const normalizeProjectData = (project) => {
  if (!project) return null
  
  try {
    return {
      // Ensure Id is always available
      Id: project.Id || project.id,
      
      // Handle both camelCase (mock) and snake_case (database) fields
      Name: project.Name || project.name || project.title || '',
      title: project.title || project.Name || project.name || '',
      description: safeString(project.description),
      client_id: project.client_id || project.clientId,
      
      // Handle numeric fields safely
      budget: safeNumber(project.budget),
      actual_cost: safeNumber(project.actual_cost || project.actualCost),
      progress: safeNumber(project.progress, 0),
      
      // Handle date fields with multiple format support
      start_date: project.start_date || project.startDate,
      end_date: project.end_date || project.endDate,
      
      // Handle status and notes
      status: project.status || 'planning',
      notes: safeString(project.notes),
      
      // System fields
      CreatedOn: project.CreatedOn || project.createdAt,
      Owner: project.Owner || project.owner
    }
  } catch (error) {
    console.error('Error normalizing project data:', error, project)
    return null
  }
}

// Safe string utility with null/undefined protection
const safeString = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  return String(value).trim()
}

// Safe number utility with validation
const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue
  const num = typeof value === 'number' ? value : parseFloat(value)
  return isNaN(num) ? defaultValue : Math.max(0, num)
}

// Safe date formatting with error handling
const safeDateFormat = (dateValue) => {
  if (!dateValue) return 'N/A'
  
  try {
    // Handle various date formats
    let date
    if (typeof dateValue === 'string') {
      // Handle ISO strings and other formats
      date = new Date(dateValue)
    } else if (dateValue instanceof Date) {
      date = dateValue
    } else {
      return 'N/A'
    }
    
    if (isNaN(date.getTime())) return 'N/A'
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Date formatting error:', error, dateValue)
    return 'N/A'
  }
}

// Safe currency formatting with comprehensive validation
const safeCurrencyFormat = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A'
  
  try {
    const numValue = typeof value === 'number' ? value : parseFloat(value)
    if (isNaN(numValue)) return 'N/A'
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue)
  } catch (error) {
    console.error('Currency formatting error:', error, value)
    return 'N/A'
  }
}

// Progress validation with bounds checking
const safeProgress = (progress) => {
  const numProgress = safeNumber(progress, 0)
  return Math.max(0, Math.min(100, numProgress))
}

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
  const [componentError, setComponentError] = useState(null)
  
  // Enhanced form data with validation state
  const [formData, setFormData] = useState({
    Name: '',
    title: '',
    description: '',
    client_id: '',
    budget: '',
    start_date: '',
    end_date: '',
    notes: '',
    status: 'planning'
  })
  
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      setComponentError(null)
      
      const data = await projectService.getAll()
      
      // Ensure we have valid data and normalize it
      if (!Array.isArray(data)) {
        console.warn('Projects data is not an array:', data)
        setProjects([])
        return
      }
      
      // Normalize all project data
      const normalizedProjects = data
        .map(normalizeProjectData)
        .filter(project => project !== null)
      
      setProjects(normalizedProjects)
      
    } catch (err) {
      const errorMessage = err?.message || 'Failed to load projects'
      console.error('Error fetching projects:', err)
      setError(errorMessage)
      toast.error(errorMessage)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Enhanced validation function
  const validateForm = () => {
    const errors = {}
    
    // Title validation
    if (!formData.title?.trim()) {
      errors.title = 'Project title is required'
    }
    
    // Client ID validation
    if (!formData.client_id) {
      errors.client_id = 'Client ID is required'
    } else {
      const clientId = parseInt(formData.client_id)
      if (isNaN(clientId) || clientId <= 0) {
        errors.client_id = 'Client ID must be a valid positive number'
      }
    }
    
    // Budget validation (if provided)
    if (formData.budget && formData.budget !== '') {
      const budgetValue = parseFloat(formData.budget)
      if (isNaN(budgetValue) || budgetValue < 0) {
        errors.budget = 'Budget must be a valid positive number'
      }
    }
    
    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      if (startDate > endDate) {
        errors.end_date = 'End date must be after start date'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    try {
      setComponentError(null)
      
      // Validate form
      if (!validateForm()) {
        // Show first error
        const firstError = Object.values(formErrors)[0]
        if (firstError) toast.error(firstError)
        return
      }

      setIsSubmitting(true)
      
      // Prepare clean data for submission with proper type conversion
      const projectData = {
        // Required fields
        Name: safeString(formData.Name || formData.title),
        title: safeString(formData.title),
        client_id: parseInt(formData.client_id),
        
        // Optional fields with proper defaults
        description: safeString(formData.description),
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        notes: safeString(formData.notes),
        status: formData.status || 'planning',
        progress: 0,
        actual_cost: 0
      }
      
      // Validate final data before submission
      if (!projectData.title || !projectData.client_id) {
        throw new Error('Missing required fields')
      }

      const newProject = await projectService.create(projectData)
      
      if (newProject) {
        // Normalize the new project and add to list
        const normalizedProject = normalizeProjectData(newProject)
        if (normalizedProject) {
          setProjects(prev => [normalizedProject, ...prev])
        }
        
        setShowCreateModal(false)
        resetForm()
        toast.success('Project created successfully')
      } else {
        throw new Error('Failed to create project - no data returned')
      }
      
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create project'
      console.error('Error creating project:', err)
      setComponentError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setComponentError(null)
      
      if (!id) {
        toast.error('Invalid project ID')
        return
      }

      if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        return
      }

      await projectService.delete(id)
      
      // Remove from local state
      setProjects(prev => prev.filter(p => p?.Id !== id))
      toast.success('Project deleted successfully')
      
      // Close detail modal if deleting the currently viewed project
      if (selectedProject?.Id === id) {
        setShowDetailModal(false)
        setSelectedProject(null)
      }
      
    } catch (err) {
      const errorMessage = err?.message || 'Failed to delete project'
      console.error('Error deleting project:', err)
      setComponentError(errorMessage)
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
      notes: '',
      status: 'planning'
    })
    setFormErrors({})
  }

  // Enhanced filtering with comprehensive safety checks
  const filteredProjects = React.useMemo(() => {
    try {
      if (!Array.isArray(projects)) return []
      
      return projects.filter(project => {
        if (!project || !project.Id) return false
        
        // Search filter with multiple field support
        let matchesSearch = true
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase().trim()
          const searchableFields = [
            project.title,
            project.description,
            project.Name,
            project.notes
          ]
          
          matchesSearch = searchableFields.some(field => 
            field && typeof field === 'string' && 
            field.toLowerCase().includes(searchLower)
          )
        }
        
        // Status filter
        const matchesFilter = filterStatus === 'all' || 
          (project.status && project.status === filterStatus)
        
        return matchesSearch && matchesFilter
      })
    } catch (error) {
      console.error('Error filtering projects:', error)
      return []
    }
  }, [projects, searchTerm, filterStatus])

  // Enhanced form field handlers with validation
  const handleFormFieldChange = (field, value) => {
    try {
      setFormData(prev => ({ ...prev, [field]: value }))
      
      // Clear field error when user starts typing
      if (formErrors[field]) {
        setFormErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    } catch (error) {
      console.error('Error updating form field:', error)
    }
  }

  const handleNumericFieldChange = (field, value, parser = parseFloat) => {
    try {
      if (value === '') {
        setFormData(prev => ({ ...prev, [field]: '' }))
      } else {
        const numValue = parser(value)
        if (!isNaN(numValue) && numValue >= 0) {
          setFormData(prev => ({ ...prev, [field]: value }))
        }
      }
      
      // Clear field error
      if (formErrors[field]) {
        setFormErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    } catch (error) {
      console.error('Error updating numeric field:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <Loading />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Error message={error} onRetry={fetchProjects} />
      </div>
    )
  }

  // Component error state
  if (componentError) {
    return (
      <div className="p-6">
        <Error 
          title="Component Error"
          message={componentError} 
          onRetry={() => {
            setComponentError(null)
            fetchProjects()
          }} 
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">Manage and track your ongoing projects</p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" size={16} />
            New Project
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search projects by title, description, or notes..."
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <Empty 
          message={searchTerm || filterStatus !== 'all' 
            ? "No projects match your search criteria" 
            : "No projects found. Create your first project to get started."
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map(project => {
            // Additional safety check
            if (!project || !project.Id) return null
            
            try {
              return (
                <Card key={project.Id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {safeString(project.title || project.Name) || 'Untitled Project'}
                      </h3>
                      
                      {/* Enhanced description rendering with proper error handling */}
                      <div className="text-gray-600 mb-4">
                        <p className="line-clamp-3">
                          {safeString(project.description) || 'No description available'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <p><strong>Budget:</strong> {safeCurrencyFormat(project.budget)}</p>
                          <p><strong>Actual Cost:</strong> {safeCurrencyFormat(project.actual_cost)}</p>
                        </div>
                        <div>
                          <p><strong>Start Date:</strong> {safeDateFormat(project.start_date)}</p>
                          <p><strong>End Date:</strong> {safeDateFormat(project.end_date)}</p>
                        </div>
                        <div>
                          <p><strong>Progress:</strong> {safeProgress(project.progress)}%</p>
                          <p><strong>Client ID:</strong> {project.client_id || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {/* Notes section with safety checks */}
                      {project.notes && safeString(project.notes) && (
                        <div className="mb-4">
                          <p className="text-gray-600 italic text-sm">
                            <strong>Notes:</strong> {safeString(project.notes)}
                          </p>
                        </div>
                      )}
                      
                      {/* Enhanced progress bar with better visuals */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${safeProgress(project.progress)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {safeProgress(project.progress)}% Complete
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <StatusBadge status={project.status || 'planning'} />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project)
                            setShowDetailModal(true)
                          }}
                          title="View details"
                        >
                          <ApperIcon name="Eye" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.Id)}
                          title="Delete project"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            } catch (error) {
              console.error('Error rendering project card:', error, project)
              return null
            }
          })}
        </div>
      )}

      {/* Enhanced Create Modal with better validation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
              
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleFormFieldChange('title', e.target.value)}
                    required
                    placeholder="Enter project title"
                    className={formErrors.title ? 'border-red-500' : ''}
                  />
                  {formErrors.title && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.title}</p>
                  )}
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
                    className={formErrors.client_id ? 'border-red-500' : ''}
                  />
                  {formErrors.client_id && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.client_id}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleFormFieldChange('description', e.target.value)}
                    placeholder="Enter project description"
                    maxLength="1000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/1000 characters
                  </p>
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
                    className={formErrors.budget ? 'border-red-500' : ''}
                  />
                  {formErrors.budget && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.budget}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      min={formData.start_date}
                      className={formErrors.end_date ? 'border-red-500' : ''}
                    />
                    {formErrors.end_date && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.end_date}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormFieldChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="on-hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    rows="2"
                    value={formData.notes}
                    onChange={(e) => handleFormFieldChange('notes', e.target.value)}
                    placeholder="Additional notes (optional)"
                    maxLength="500"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-6">
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
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      'Create Project'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Detail Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {safeString(selectedProject.title || selectedProject.Name) || 'Untitled Project'}
                  </h3>
                  <StatusBadge status={selectedProject.status || 'planning'} />
                </div>
                
                {selectedProject.description && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600">{safeString(selectedProject.description)}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Project Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Client ID:</strong> {selectedProject.client_id || 'N/A'}</p>
                      <p><strong>Budget:</strong> {safeCurrencyFormat(selectedProject.budget)}</p>
                      <p><strong>Actual Cost:</strong> {safeCurrencyFormat(selectedProject.actual_cost)}</p>
                      <p><strong>Progress:</strong> {safeProgress(selectedProject.progress)}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Start Date:</strong> {safeDateFormat(selectedProject.start_date)}</p>
                      <p><strong>End Date:</strong> {safeDateFormat(selectedProject.end_date)}</p>
                      <p><strong>Created:</strong> {safeDateFormat(selectedProject.CreatedOn)}</p>
                    </div>
                  </div>
                </div>
                
                {selectedProject.notes && safeString(selectedProject.notes) && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                      {safeString(selectedProject.notes)}
                    </p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Progress</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${safeProgress(selectedProject.progress)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {safeProgress(selectedProject.progress)}% Complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap the main component in error boundary
const ProjectsWithErrorBoundary = () => (
  <ProjectsErrorBoundary>
    <Projects />
  </ProjectsErrorBoundary>
)

export default ProjectsWithErrorBoundary