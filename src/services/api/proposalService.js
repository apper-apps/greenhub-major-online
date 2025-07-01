import proposalsData from '@/services/mockData/proposals.json'

let proposals = [...proposalsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const proposalService = {
  async getAll() {
    await delay(300)
    return [...proposals]
  },

  async getById(id) {
    await delay(200)
    const proposal = proposals.find(p => p.Id === parseInt(id))
    if (!proposal) {
      throw new Error('Proposal not found')
    }
    return { ...proposal }
  },

  async getByClientId(clientId) {
    await delay(250)
    return proposals.filter(p => p.clientId === parseInt(clientId))
  },

  async create(proposalData) {
    await delay(400)
    const newProposal = {
      Id: Math.max(...proposals.map(p => p.Id), 0) + 1,
      ...proposalData,
      createdAt: new Date().toISOString(),
      status: 'pending',
      acceptedAt: null
    }
    proposals.push(newProposal)
    return { ...newProposal }
  },

  async update(id, proposalData) {
    await delay(350)
    const index = proposals.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Proposal not found')
    }
    proposals[index] = { ...proposals[index], ...proposalData }
    return { ...proposals[index] }
  },

  async delete(id) {
    await delay(300)
    const index = proposals.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Proposal not found')
    }
    proposals.splice(index, 1)
    return true
  },

  async updateStatus(id, status) {
    await delay(250)
    const index = proposals.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Proposal not found')
    }
    proposals[index].status = status
    if (status === 'accepted') {
      proposals[index].acceptedAt = new Date().toISOString()
    }
    return { ...proposals[index] }
  }
}