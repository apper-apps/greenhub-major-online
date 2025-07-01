export const proposalService = {
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
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "status" } },
          { field: { Name: "subtotal" } },
          { field: { Name: "tax" } },
          { field: { Name: "total" } },
          { field: { Name: "valid_until" } },
          { field: { Name: "notes" } },
          { field: { Name: "signing_link" } },
          { field: { Name: "client_id" } }
        ]
      };

      const response = await apperClient.fetchRecords('proposal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching proposals:", error);
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
          { field: { Name: "title" } },
          { field: { Name: "description" } },
          { field: { Name: "status" } },
          { field: { Name: "subtotal" } },
          { field: { Name: "tax" } },
          { field: { Name: "total" } },
          { field: { Name: "valid_until" } },
          { field: { Name: "notes" } },
          { field: { Name: "signing_link" } },
          { field: { Name: "client_id" } }
        ]
      };

      const response = await apperClient.getRecordById('proposal', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching proposal with ID ${id}:`, error);
      throw error;
    }
  },

  async create(proposalData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: proposalData.Name || proposalData.title,
            title: proposalData.title,
            description: proposalData.description,
            status: 'pending',
            subtotal: proposalData.subtotal || 0,
            tax: proposalData.tax || 0,
            total: proposalData.total || 0,
            valid_until: proposalData.valid_until || proposalData.validUntil,
            notes: proposalData.notes,
            client_id: parseInt(proposalData.client_id) || parseInt(proposalData.clientId)
          }
        ]
      };

      const response = await apperClient.createRecord('proposal', params);
      
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
      console.error("Error creating proposal:", error);
      throw error;
    }
  },

  async update(id, proposalData) {
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
            ...proposalData
          }
        ]
      };

      const response = await apperClient.updateRecord('proposal', params);
      
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
      console.error("Error updating proposal:", error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    return this.update(id, { status });
  },

  async generateSigningLink(id) {
    try {
      const { nanoid } = await import('nanoid');
      const signingLink = `${window.location.origin}/sign/proposal/${nanoid(32)}`;
      
      const updated = await this.update(id, { signing_link: signingLink });
      
      return {
        signingLink,
        proposal: updated
      };
    } catch (error) {
      console.error("Error generating signing link:", error);
      throw error;
    }
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

      const response = await apperClient.deleteRecord('proposal', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting proposal:", error);
      throw error;
    }
  }
};