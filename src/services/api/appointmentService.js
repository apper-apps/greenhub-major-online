import appointmentsData from '@/services/mockData/appointments.json'

let appointments = [...appointmentsData]

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export const appointmentService = {
  async getAll() {
    await delay(300)
    return [...appointments]
  },

  async getById(id) {
    await delay(200)
    const appointment = appointments.find(a => a.Id === parseInt(id))
    if (!appointment) {
      throw new Error('Appointment not found')
    }
    return { ...appointment }
  },

  async getByClientId(clientId) {
    await delay(250)
    return appointments.filter(a => a.clientId === parseInt(clientId))
  },

  async getByDate(date) {
    await delay(250)
    const targetDate = new Date(date).toDateString()
    return appointments.filter(a => 
      new Date(a.date).toDateString() === targetDate
    )
  },

  async create(appointmentData) {
    await delay(400)
    const newAppointment = {
      Id: Math.max(...appointments.map(a => a.Id), 0) + 1,
      ...appointmentData,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    }
    appointments.push(newAppointment)
    return { ...newAppointment }
  },

  async update(id, appointmentData) {
    await delay(350)
    const index = appointments.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Appointment not found')
    }
    appointments[index] = { ...appointments[index], ...appointmentData }
    return { ...appointments[index] }
  },

  async delete(id) {
    await delay(300)
    const index = appointments.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Appointment not found')
    }
    appointments.splice(index, 1)
    return true
  },

  async updateStatus(id, status) {
    await delay(250)
    const index = appointments.findIndex(a => a.Id === parseInt(id))
    if (index === -1) {
      throw new Error('Appointment not found')
    }
    appointments[index].status = status
    return { ...appointments[index] }
  }
}