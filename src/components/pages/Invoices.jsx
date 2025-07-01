import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { invoiceService } from '@/services/api/invoiceService'
import ApperIcon from '@/components/ApperIcon'
import Button from '@/components/atoms/Button'
import Card from '@/components/atoms/Card'
import Input from '@/components/atoms/Input'
import SearchBar from '@/components/molecules/SearchBar'
import StatusBadge from '@/components/molecules/StatusBadge'
import Loading from '@/components/ui/Loading'
import Error from '@/components/ui/Error'
import Empty from '@/components/ui/Empty'

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    projectId: '',
    clientId: '',
    subtotal: 0,
    tax: 0,
    total: 0,
    dueDate: '',
    notes: ''
  })

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const data = await invoiceService.getAll()
      setInvoices(data)
    } catch (err) {
      setError(err.message)
      toast.error('Failed to load invoices')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formData.clientId || !formData.total) {
      toast.error('Please fill in required fields')
      return
    }

    try {
      setIsSubmitting(true)
      const newInvoice = await invoiceService.create(formData)
      setInvoices(prev => [newInvoice, ...prev])
      setShowCreateModal(false)
      resetForm()
      toast.success('Invoice created successfully')
    } catch (err) {
      toast.error('Failed to create invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return

    try {
      await invoiceService.delete(id)
      setInvoices(prev => prev.filter(i => i.Id !== id))
      toast.success('Invoice deleted successfully')
      if (selectedInvoice?.Id === id) {
        setShowDetailModal(false)
        setSelectedInvoice(null)
      }
    } catch (err) {
      toast.error('Failed to delete invoice')
    }
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      const updated = await invoiceService.updateStatus(id, status)
      setInvoices(prev => prev.map(i => i.Id === id ? updated : i))
      if (selectedInvoice?.Id === id) {
        setSelectedInvoice(updated)
      }
      toast.success(`Invoice marked as ${status}`)
    } catch (err) {
      toast.error('Failed to update invoice status')
    }
  }

  const handleGenerateSigningLink = async (id) => {
    try {
      const result = await invoiceService.generateSigningLink(id)
      setInvoices(prev => prev.map(i => i.Id === id ? result.invoice : i))
      if (selectedInvoice?.Id === id) {
        setSelectedInvoice(result.invoice)
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

  const handleEmailLink = (invoice) => {
    const subject = encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)
    const body = encodeURIComponent(`Please review and sign the invoice: ${invoice.signingLink}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const resetForm = () => {
    setFormData({
      projectId: '',
      clientId: '',
      subtotal: 0,
      tax: 0,
      total: 0,
      dueDate: '',
      notes: ''
    })
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || invoice.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) return <Loading />
  if (error) return <Error message={error} onRetry={fetchInvoices} />

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">Manage invoices and billing</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <ApperIcon name="Plus" size={16} />
            Create Invoice
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search invoices..."
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {filteredInvoices.length === 0 ? (
        <Empty message="No invoices found" />
      ) : (
        <div className="grid gap-4">
          {filteredInvoices.map(invoice => (
            <Card key={invoice.Id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {invoice.invoiceNumber}
                  </h3>
                  <p className="text-gray-600 mb-2">{invoice.notes}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Total: ${invoice.total?.toFixed(2)}</span>
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={invoice.status} />
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice)
                        setShowDetailModal(true)
                      }}
                    >
                      <ApperIcon name="Eye" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateSigningLink(invoice.Id)}
                    >
                      <ApperIcon name="Link" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invoice.Id)}
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              {invoice.signingLink && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 mb-1">Signing Link</p>
                      <p className="text-xs text-gray-500 truncate">{invoice.signingLink}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyLink(invoice.signingLink)}
                      >
                        <ApperIcon name="Copy" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEmailLink(invoice)}
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
              <h2 className="text-lg font-semibold mb-4">Create New Invoice</h2>
              <form onSubmit={handleCreate} className="space-y-4">
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
                    Project ID
                  </label>
                  <Input
                    type="number"
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Amount *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.total}
                    onChange={(e) => setFormData(prev => ({ ...prev, total: parseFloat(e.target.value) }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
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
                    {isSubmitting ? 'Creating...' : 'Create Invoice'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg font-semibold">{selectedInvoice.invoiceNumber}</h2>
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
                  <p className="text-sm font-medium text-gray-700">Notes</p>
                  <p className="text-gray-600">{selectedInvoice.notes}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total</p>
                    <p className="text-lg font-semibold">${selectedInvoice.total?.toFixed(2)}</p>
                  </div>
                </div>

                {selectedInvoice.signingLink && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Signing Link</p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedInvoice.signingLink}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyLink(selectedInvoice.signingLink)}
                      >
                        <ApperIcon name="Copy" size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailLink(selectedInvoice)}
                      >
                        <ApperIcon name="Mail" size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedInvoice.status !== 'paid' && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedInvoice.Id, 'paid')}
                    >
                      Mark as Paid
                    </Button>
                  )}
                  {selectedInvoice.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedInvoice.Id, 'sent')}
                    >
                      Mark as Sent
                    </Button>
                  )}
                  {!selectedInvoice.signingLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSigningLink(selectedInvoice.Id)}
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

export default Invoices