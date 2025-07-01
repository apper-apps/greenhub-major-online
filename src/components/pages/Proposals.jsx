import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { proposalService } from '@/services/api/proposalService'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import SearchBar from '@/components/molecules/SearchBar'
import StatusBadge from '@/components/molecules/StatusBadge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'

const Proposals = () => {
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedProposal, setSelectedProposal] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: '',
    title: '',
    description: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    validUntil: '',
    notes: ''
  })

  useEffect(() => {
    fetchProposals()
  }, [])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      const data = await proposalService.getAll()
      setProposals(data)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load proposals')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.clientId) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      const newProposal = await proposalService.create(formData)
      setProposals(prev => [newProposal, ...prev])
      setShowCreateModal(false)
      resetForm()
      toast.success('Proposal created successfully')
    } catch (err) {
      toast.error('Failed to create proposal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this proposal?')) return

    try {
      await proposalService.delete(id)
      setProposals(prev => prev.filter(p => p.Id !== id))
      toast.success('Proposal deleted successfully')
      if (selectedProposal?.Id === id) {
        setShowDetailModal(false)
        setSelectedProposal(null)
      }
    } catch (err) {
      toast.error('Failed to delete proposal')
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      const updated = await proposalService.updateStatus(id, status)
      setProposals(prev => prev.map(p => p.Id === id ? updated : p))
      if (selectedProposal?.Id === id) {
        setSelectedProposal(updated)
      }
      toast.success(`Proposal ${status} successfully`)
    } catch (err) {
      toast.error('Failed to update proposal status')
    }
  }

  const handleGenerateSigningLink = async (id) => {
    try {
      const result = await proposalService.generateSigningLink(id)
      setProposals(prev => prev.map(p => p.Id === id ? result.proposal : p))
      if (selectedProposal?.Id === id) {
        setSelectedProposal(result.proposal)
      }
      
      // Copy to clipboard
      await navigator.clipboard.writeText(result.signingLink)
      toast.success('Signing link generated and copied to clipboard')
    } catch (err) {
      toast.error('Failed to generate signing link')
    }
  }

  const handleCopyLink = async (link) => {
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copied to clipboard')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleEmailLink = (proposal) => {
    const subject = encodeURIComponent(`Proposal for ${proposal.title}`)
    const body = encodeURIComponent(`Please review and sign the proposal: ${proposal.signingLink}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const resetForm = () => {
    setFormData({
      clientId: '',
      title: '',
      description: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      validUntil: '',
      notes: ''
    })
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || proposal.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={fetchProposals} />

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Proposals</h1>
            <p className="text-gray-600">Create and manage project proposals</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <ApperIcon name="Plus" size={16} />
            Create Proposal
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search proposals..."
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredProposals.length === 0 ? (
        <Empty message="No proposals found" />
      ) : (
        <div className="grid gap-4">
          {filteredProposals.map(proposal => (
            <Card key={proposal.Id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {proposal.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{proposal.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Total: ${proposal.total?.toFixed(2)}</span>
                    <span>Valid until: {new Date(proposal.validUntil).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={proposal.status} />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProposal(proposal)
                        setShowDetailModal(true)
                      }}
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateSigningLink(proposal.Id)}
                    >
                      <ApperIcon name="Link" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(proposal.Id)}
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {proposal.signingLink && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Signing Link</p>
                      <p className="text-xs text-gray-500 truncate">{proposal.signingLink}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(proposal.signingLink)}
                      >
                        <ApperIcon name="Copy" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmailLink(proposal)}
                      >
                        <ApperIcon name="Mail" size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Create New Proposal</h2>
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
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: parseInt(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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
                    {isSubmitting ? 'Creating...' : 'Create Proposal'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">{selectedProposal.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetailModal(false)}
                >
                  <ApperIcon name="X" size={16} />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Description</p>
                  <p className="text-gray-600">{selectedProposal.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <StatusBadge status={selectedProposal.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total</p>
                    <p className="text-lg font-semibold">${selectedProposal.total?.toFixed(2)}</p>
                  </div>
                </div>

                {selectedProposal.signingLink && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Signing Link</p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedProposal.signingLink}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(selectedProposal.signingLink)}
                      >
                        <ApperIcon name="Copy" size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailLink(selectedProposal)}
                      >
                        <ApperIcon name="Mail" size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedProposal.status === 'pending' && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedProposal.Id, 'accepted')}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() => handleStatusUpdate(selectedProposal.Id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {!selectedProposal.signingLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSigningLink(selectedProposal.Id)}
                    >
                      <ApperIcon name="Link" size={14} />
                      Generate Signing Link
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Proposals