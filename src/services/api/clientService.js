import clientsData from '@/services/mockData/clients.json'

let clients = [...clientsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const clientService = {
  async getAll() {
    await delay(300)
    return [...clients]
  },

  async getById(id) {
    await delay(200)
    const client = clients.find(c => c.Id === parseInt(id))
    if (!client) {
      throw new Error('Client not found')
    }
    return { ...client }
  },

  async create(clientData) {
    await delay(400)
    const newClient = {
      Id: Math.max(...clients.map(c => c.Id), 0) + 1,
      ...clientData,
      createdAt: new Date().toISOString(),
      status: 'active',
      projectsCount: 0,
      totalRevenue: 0.00
    }
    clients.push(newClient)
    return { ...newClient }
  },

  async update(id, clientData) {
    await delay(350)
    const index = clients.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Client not found')
    }
    clients[index] = { ...clients[index], ...clientData }
    return { ...clients[index] }
  },

  async delete(id) {
    await delay(300)
    const index = clients.findIndex(c => c.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Client not found')
    }
    clients.splice(index, 1)
    return true
  },

  async search(query) {
    await delay(250)
    const searchTerm = query.toLowerCase()
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm) ||
      client.phone.includes(searchTerm) ||
      client.address.toLowerCase().includes(searchTerm)
    )
  }
}