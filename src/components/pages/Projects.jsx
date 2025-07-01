import React, { Component, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StatusBadge from "@/components/molecules/StatusBadge";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";
import { projectService } from "@/services/api/projectService";

// Safe string utility with bulletproof null/undefined protection
const safeString = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'object') {
    // Handle cases where objects are passed instead of strings
    console.warn('Object passed to safeString:', value)
    return ''
  }
  try {
    return String(value).trim()
  } catch (error) {
    console.error('Error converting to string:', error, value)
    return ''
  }
}

// Safe number utility with comprehensive validation
const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue
  if (typeof value === 'boolean') return defaultValue
  
  try {
    const num = typeof value === 'number' ? value : parseFloat(String(value))
    if (isNaN(num) || !isFinite(num)) return defaultValue
    return Math.max(0, num)
  } catch (error) {
    console.error('Error parsing number:', error, value)
    return defaultValue
  }
}

// Safe date formatting with comprehensive error handling
const safeDateFormat = (dateValue) => {
  if (!dateValue) return 'N/A'
  
  try {
    let date
    if (typeof dateValue === 'string') {
      if (dateValue.trim() === '') return 'N/A'
      date = new Date(dateValue)
    } else if (dateValue instanceof Date) {
      date = dateValue
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue)
    } else {
      console.warn('Invalid date value type:', typeof dateValue, dateValue)
      return 'N/A'
    }
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateValue)
      return 'N/A'
    }
    
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

// Safe currency formatting with extensive validation
const safeCurrencyFormat = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A'
  
  try {
    const numValue = safeNumber(value, NaN)
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

// Progress validation with strict bounds checking
const safeProgress = (progress) => {
  const numProgress = safeNumber(progress, 0)
  return Math.max(0, Math.min(100, numProgress))
}

// Enhanced data normalization with comprehensive error handling
const normalizeProjectData = (project) => {
  if (!project || typeof project !== 'object') {
    console.warn('Invalid project data:', project)
    return null
  }
  
  try {
    const normalized = {
      // Ensure Id is always available and is a number
      Id: safeNumber(project.Id || project.id, null),
      
      // Handle both camelCase (mock) and snake_case (database) fields
      Name: safeString(project.Name || project.name || project.title),
      title: safeString(project.title || project.Name || project.name),
      description: safeString(project.description),
      client_id: safeNumber(project.client_id || project.clientId, null),
      
      // Handle numeric fields safely
      budget: safeNumber(project.budget),
      actual_cost: safeNumber(project.actual_cost || project.actualCost),
      progress: safeNumber(project.progress, 0),
      
      // Handle date fields with multiple format support
      start_date: project.start_date || project.startDate || null,
      end_date: project.end_date || project.endDate || null,
      
      // Handle status and notes
      status: safeString(project.status) || 'planning',
      notes: safeString(project.notes),
      tasks: safeString(project.tasks),
      
      // System fields
      CreatedOn: project.CreatedOn || project.createdAt || null,
      Owner: project.Owner || project.owner || null
    }
    
    // Validate required fields
    if (!normalized.Id || (!normalized.title && !normalized.Name)) {
      console.warn('Project missing required fields:', normalized)
      return null
    }
    
    return normalized
  } catch (error) {
    console.error('Error normalizing project data:', error, project)
    return null
  }
}

// Enhanced Error Boundary Component with detailed logging and recovery
class ProjectsErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced logging with component context and stack trace
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      props: this.props
    }
    
console.error('Projects component crashed:', errorDetails)
    
    // Log to external service in production
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
      // Add external error logging service here
      console.error('Production error logged:', errorDetails)
    }
    
    this.setState({ errorInfo })
    
    // Show user-friendly error message
    toast.error('An unexpected error occurred in the Projects component. The error has been logged for debugging.')
  }

  handleRetry = () => {
    console.log('Retrying Projects component after error, attempt:', this.state.retryCount + 1)
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <Error 
            title="Projects Component Error"
            message={`Something went wrong with the Projects component. ${this.state.error?.message || 'Unknown error occurred'}`}
            onRetry={this.handleRetry}
/>
          {/* Development error details */}
          {(typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') && this.state.errorInfo && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="text-sm font-medium text-red-800 mb-2">Error Details (Development)</h3>
              <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto max-h-40">
                {this.state.error?.stack}
              </pre>
              <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-40 mt-2">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      )
    }

    return this.props.children
  }
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
    const startTime = performance.now()
    
    try {
      setLoading(true)
      setError(null)
      setComponentError(null)
      
      console.log('Fetching projects...')
      const data = await projectService.getAll()
      console.log('Projects fetched successfully:', data?.length || 0, 'projects')
      
      // Ensure we have valid data and normalize it
      if (!Array.isArray(data)) {
        console.warn('Projects data is not an array:', typeof data, data)
        setProjects([])
        return
      }
      
      // Normalize all project data with individual error handling
      const normalizedProjects = []
      data.forEach((project, index) => {
        try {
          const normalized = normalizeProjectData(project)
          if (normalized) {
            normalizedProjects.push(normalized)
          } else {
            console.warn(`Skipping invalid project at index ${index}:`, project)
          }
        } catch (error) {
          console.error(`Error normalizing project at index ${index}:`, error, project)
        }
      })
      
      setProjects(normalizedProjects)
      console.log('Projects normalized and set:', normalizedProjects.length, 'valid projects')
      
    } catch (err) {
      const errorMessage = err?.message || 'Failed to load projects'
      console.error('Error fetching projects:', {
        error: err,
        message: errorMessage,
        stack: err?.stack,
        timestamp: new Date().toISOString()
      })
      setError(errorMessage)
      toast.error(errorMessage)
      setProjects([])
    } finally {
      setLoading(false)
      const endTime = performance.now()
      console.log(`Projects fetch completed in ${(endTime - startTime).toFixed(2)}ms`)
    }
  }

  // Enhanced validation function with comprehensive checks
  const validateForm = () => {
    const errors = {}
    
    try {
      // Title validation
      const title = safeString(formData.title)
      if (!title) {
        errors.title = 'Project title is required'
      } else if (title.length < 3) {
        errors.title = 'Project title must be at least 3 characters'
      } else if (title.length > 100) {
        errors.title = 'Project title must be less than 100 characters'
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
      
      // Description validation
      const description = safeString(formData.description)
      if (description.length > 1000) {
        errors.description = 'Description must be less than 1000 characters'
      }
      
      // Budget validation (if provided)
      if (formData.budget && formData.budget !== '') {
        const budgetValue = parseFloat(formData.budget)
        if (isNaN(budgetValue) || budgetValue < 0) {
          errors.budget = 'Budget must be a valid positive number'
        } else if (budgetValue > 10000000) {
          errors.budget = 'Budget must be less than $10,000,000'
        }
      }
      
      // Date validation
      if (formData.start_date && formData.end_date) {
        const startDate = new Date(formData.start_date)
        const endDate = new Date(formData.end_date)
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          errors.end_date = 'Invalid date format'
        } else if (startDate > endDate) {
          errors.end_date = 'End date must be after start date'
        }
      }
      
      // Notes validation
      const notes = safeString(formData.notes)
      if (notes.length > 500) {
        errors.notes = 'Notes must be less than 500 characters'
      }
      
    } catch (error) {
      console.error('Error during form validation:', error)
      errors.general = 'Form validation error occurred'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    const startTime = performance.now()
    
    try {
      setComponentError(null)
      
      console.log('Starting project creation...', formData)
      
      // Validate form
      if (!validateForm()) {
        const firstError = Object.values(formErrors)[0]
        if (firstError) {
          toast.error(firstError)
          console.warn('Form validation failed:', formErrors)
        }
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
      
      console.log('Prepared project data for submission:', projectData)
      
      // Final validation before submission
      if (!projectData.title || !projectData.client_id) {
        throw new Error('Missing required fields after processing')
      }

      const newProject = await projectService.create(projectData)
      console.log('Project created successfully:', newProject)
      
      if (newProject) {
        // Normalize the new project and add to list
        const normalizedProject = normalizeProjectData(newProject)
        if (normalizedProject) {
          setProjects(prev => [normalizedProject, ...prev])
          console.log('Project added to local state')
        } else {
          console.warn('Failed to normalize new project:', newProject)
        }
        
        setShowCreateModal(false)
        resetForm()
        toast.success('Project created successfully')
      } else {
        throw new Error('Failed to create project - no data returned')
      }
      
    } catch (err) {
      const errorMessage = err?.message || 'Failed to create project'
      console.error('Error creating project:', {
        error: err,
        message: errorMessage,
        formData,
        stack: err?.stack,
        timestamp: new Date().toISOString()
      })
      setComponentError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
      const endTime = performance.now()
      console.log(`Project creation completed in ${(endTime - startTime).toFixed(2)}ms`)
    }
  }

  const handleDelete = async (id) => {
    if (!id) {
      console.error('Delete called with invalid ID:', id)
      toast.error('Invalid project ID')
      return
    }

    try {
      setComponentError(null)
      
      if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        console.log('Delete cancelled by user')
        return
      }

      console.log('Deleting project:', id)
      await projectService.delete(id)
      console.log('Project deleted successfully:', id)
      
      // Remove from local state
      setProjects(prev => prev.filter(p => p?.Id !== id))
      toast.success('Project deleted successfully')
      
      // Close detail modal if deleting the currently viewed project
      if (selectedProject?.Id === id) {
        setShowDetailModal(false)
        setSelectedProject(null)
        console.log('Closed detail modal for deleted project')
      }
      
    } catch (err) {
      const errorMessage = err?.message || 'Failed to delete project'
      console.error('Error deleting project:', {
        error: err,
        projectId: id,
        message: errorMessage,
        stack: err?.stack,
        timestamp: new Date().toISOString()
      })
      setComponentError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const resetForm = () => {
    console.log('Resetting form')
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
      if (!Array.isArray(projects)) {
        console.warn('Projects is not an array for filtering:', typeof projects, projects)
        return []
      }
      
      const filtered = projects.filter(project => {
        if (!project || !project.Id) {
          console.warn('Invalid project in filter:', project)
          return false
        }
        
        // Search filter with multiple field support
        let matchesSearch = true
        if (searchTerm) {
          const searchLower = safeString(searchTerm).toLowerCase()
          if (searchLower) {
            const searchableFields = [
              safeString(project.title),
              safeString(project.description),
              safeString(project.Name),
              safeString(project.notes)
            ]
            
            matchesSearch = searchableFields.some(field => 
              field && field.toLowerCase().includes(searchLower)
            )
          }
        }
        
        // Status filter
        const matchesFilter = filterStatus === 'all' || 
          (project.status && safeString(project.status) === filterStatus)
        
        return matchesSearch && matchesFilter
      })
      
      console.log(`Filtered ${projects.length} projects to ${filtered.length} results`)
      return filtered
    } catch (error) {
      console.error('Error filtering projects:', error)
      return []
    }
  }, [projects, searchTerm, filterStatus])

  // Enhanced form field handlers with validation
  const handleFormFieldChange = (field, value) => {
    try {
      console.log(`Updating form field ${field}:`, value)
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
      console.error('Error updating form field:', error, { field, value })
    }
  }

  const handleNumericFieldChange = (field, value, parser = parseFloat) => {
    try {
      console.log(`Updating numeric field ${field}:`, value)
      
      if (value === '') {
        setFormData(prev => ({ ...prev, [field]: '' }))
      } else {
        const numValue = parser(value)
        if (!isNaN(numValue) && numValue >= 0) {
          setFormData(prev => ({ ...prev, [field]: value }))
        } else {
          console.warn('Invalid numeric value rejected:', { field, value, parsed: numValue })
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
      console.error('Error updating numeric field:', error, { field, value })
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
            // Additional safety check with detailed logging
            if (!project || !project.Id) {
              console.warn('Skipping invalid project in render:', project)
              return null
            }
            
            try {
              return (
                <Card key={project.Id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                        {safeString(project.title || project.Name) || 'Untitled Project'}
                      </h3>
                      
                      {/* Bulletproof description rendering with comprehensive error handling */}
                      <div className="text-gray-600 mb-4">
                        <p className="line-clamp-3 break-words whitespace-pre-wrap">
                          {(() => {
                            try {
                              const description = safeString(project.description)
                              return description || 'No description available'
                            } catch (error) {
                              console.error('Error rendering description:', error, project.description)
                              return 'Description unavailable'
                            }
                          })()}
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
                      
                      {/* Notes section with enhanced safety checks */}
                      {(() => {
                        try {
                          const notes = safeString(project.notes)
                          if (notes) {
                            return (
                              <div className="mb-4">
                                <p className="text-gray-600 italic text-sm break-words whitespace-pre-wrap">
                                  <strong>Notes:</strong> {notes}
                                </p>
                              </div>
                            )
                          }
                        } catch (error) {
                          console.error('Error rendering notes:', error, project.notes)
                        }
                        return null
                      })()}
                      
                      {/* Enhanced progress bar with safe calculation */}
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
                      <StatusBadge status={safeString(project.status) || 'planning'} />
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
              return (
                <Card key={project.Id || 'error'} className="p-6 border-red-200">
                  <p className="text-red-600">Error displaying project data</p>
                </Card>
              )
            }
          })}
        </div>
      )}

      {/* Enhanced Create Modal with comprehensive validation */}
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
                    maxLength="100"
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
                    {safeString(formData.description).length}/1000 characters
                  </p>
                  {formErrors.description && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.description}</p>
                  )}
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
                    max="10000000"
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
                  {formErrors.notes && (
                    <p className="text-red-600 text-xs mt-1">{formErrors.notes}</p>
                  )}
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

      {/* Enhanced Detail Modal with safe rendering */}
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
                  <StatusBadge status={safeString(selectedProject.status) || 'planning'} />
                </div>
                
                {(() => {
                  try {
                    const description = safeString(selectedProject.description)
                    if (description) {
                      return (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                          <p className="text-gray-600 break-words whitespace-pre-wrap">{description}</p>
                        </div>
                      )
                    }
                  } catch (error) {
                    console.error('Error rendering description in modal:', error)
                  }
                  return null
                })()}
                
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
                
                {(() => {
                  try {
                    const notes = safeString(selectedProject.notes)
                    if (notes) {
                      return (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded-md break-words whitespace-pre-wrap">
                            {notes}
                          </p>
                        </div>
                      )
                    }
                  } catch (error) {
                    console.error('Error rendering notes in modal:', error)
                  }
                  return null
                })()}
                
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

// Wrap the main component in enhanced error boundary
const ProjectsWithErrorBoundary = () => (
  <ProjectsErrorBoundary>
    <Projects />
  </ProjectsErrorBoundary>
)

export default ProjectsWithErrorBoundary