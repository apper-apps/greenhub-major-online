import projectsData from '@/services/mockData/projects.json'

let projects = [...projectsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const projectService = {
  async getAll() {
    await delay(300)
    return [...projects]
  },

  async getById(id) {
    await delay(200)
    const project = projects.find(p => p.Id === parseInt(id))
    if (!project) {
      throw new Error('Project not found')
    }
    return { ...project }
  },

  async getByClientId(clientId) {
    await delay(250)
    return projects.filter(p => p.clientId === parseInt(clientId))
  },

  async create(projectData) {
    await delay(400)
    const newProject = {
      Id: Math.max(...projects.map(p => p.Id), 0) + 1,
      ...projectData,
      createdAt: new Date().toISOString(),
      progress: 0,
      actualCost: 0.00,
      tasks: []
    }
    projects.push(newProject)
    return { ...newProject }
  },

  async update(id, projectData) {
    await delay(350)
    const index = projects.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Project not found')
    }
    projects[index] = { ...projects[index], ...projectData }
    return { ...projects[index] }
  },

  async delete(id) {
    await delay(300)
    const index = projects.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Project not found')
    }
    projects.splice(index, 1)
    return true
  },

  async updateStatus(id, status) {
    await delay(250)
    const index = projects.findIndex(p => p.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Project not found')
    }
    projects[index].status = status
    if (status === 'completed') {
      projects[index].progress = 100
    }
    return { ...projects[index] }
  }
}