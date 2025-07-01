export const appointmentService = {
  async getAll() {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "client_id" } },
          { field: { Name: "project_id" } },
          { field: { Name: "title" } },
          { field: { Name: "type" } },
          { field: { Name: "date" } },
          { field: { Name: "duration" } },
          { field: { Name: "assigned_crew" } },
          { field: { Name: "location" } },
          { field: { Name: "status" } },
          { field: { Name: "notes" } }
        ]
      };

      const response = await apperClient.fetchRecords('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching appointments:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "client_id" } },
          { field: { Name: "project_id" } },
          { field: { Name: "title" } },
          { field: { Name: "type" } },
          { field: { Name: "date" } },
          { field: { Name: "duration" } },
          { field: { Name: "assigned_crew" } },
          { field: { Name: "location" } },
          { field: { Name: "status" } },
          { field: { Name: "notes" } }
        ]
      };

      const response = await apperClient.getRecordById('appointment', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching appointment with ID ${id}:`, error);
      throw error;
    }
  },

  async create(appointmentData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: appointmentData.Name || appointmentData.title,
            client_id: parseInt(appointmentData.client_id) || parseInt(appointmentData.clientId),
            project_id: parseInt(appointmentData.project_id) || parseInt(appointmentData.projectId) || null,
            title: appointmentData.title,
            type: appointmentData.type,
            date: appointmentData.date,
            duration: appointmentData.duration,
            assigned_crew: appointmentData.assigned_crew || appointmentData.assignedCrew,
            location: appointmentData.location,
            status: appointmentData.status || 'scheduled',
            notes: appointmentData.notes
          }
        ]
      };

      const response = await apperClient.createRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      throw error;
    }
  },

  async update(id, appointmentData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...appointmentData
          }
        ]
      };

      const response = await apperClient.updateRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          throw new Error(failedRecords[0].message);
        }
        return response.results[0].data;
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    return this.update(id, { status });
  },

  async delete(id) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('appointment', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting appointment:", error);
      throw error;
    }
  }
};