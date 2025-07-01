import invoicesData from '@/services/mockData/invoices.json'

let invoices = [...invoicesData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const invoiceService = {
  async getAll() {
    await delay(300)
    return [...invoices]
  },

  async getById(id) {
    await delay(200)
    const invoice = invoices.find(i => i.Id === parseInt(id))
    if (!invoice) {
      throw new Error('Invoice not found')
    }
    return { ...invoice }
  },

  async getByClientId(clientId) {
    await delay(250)
    return invoices.filter(i => i.clientId === parseInt(clientId))
  },

  async getByProjectId(projectId) {
    await delay(250)
    return invoices.filter(i => i.projectId === parseInt(projectId))
  },

  async create(invoiceData) {
    await delay(400)
    const newInvoice = {
      Id: Math.max(...invoices.map(i => i.Id), 0) + 1,
      ...invoiceData,
      invoiceNumber: `INV-2024-${String(Math.max(...invoices.map(i => i.Id), 0) + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
      paidDate: null
    }
    invoices.push(newInvoice)
    return { ...newInvoice }
  },

  async update(id, invoiceData) {
    await delay(350)
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Invoice not found')
    }
    invoices[index] = { ...invoices[index], ...invoiceData }
    return { ...invoices[index] }
  },

  async delete(id) {
    await delay(300)
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Invoice not found')
    }
    invoices.splice(index, 1)
    return true
  },

  async updateStatus(id, status) {
    await delay(250)
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Invoice not found')
    }
    invoices[index].status = status
    if (status === 'paid') {
      invoices[index].paidDate = new Date().toISOString()
    }
return { ...invoices[index] }
  },

  async generateSigningLink(id) {
    await delay(300)
    const { nanoid } = await import('nanoid')
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Invoice not found')
    }
    
    const signingToken = nanoid(32)
    const signingLink = `${window.location.origin}/sign/invoice/${signingToken}`
    
    invoices[index].signingToken = signingToken
    invoices[index].signingLink = signingLink
    invoices[index].signingLinkCreatedAt = new Date().toISOString()
    
    return { 
      signingLink,
      signingToken,
      invoice: { ...invoices[index] }
    }
  },

  async getBySigningToken(token) {
    await delay(200)
    const invoice = invoices.find(i => i.signingToken === token)
    if (!invoice) {
      throw new Error('Invalid signing token')
    }
    return { ...invoice }
  },

  async updateSigningStatus(id, status) {
    await delay(250)
    const index = invoices.findIndex(i => i.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Invoice not found')
    }
    
    invoices[index].signingStatus = status
    if (status === 'signed') {
      invoices[index].signedAt = new Date().toISOString()
      if (invoices[index].status === 'draft' || invoices[index].status === 'sent') {
        invoices[index].status = 'paid'
        invoices[index].paidDate = new Date().toISOString()
      }
    }
    
    return { ...invoices[index] }
  }
}