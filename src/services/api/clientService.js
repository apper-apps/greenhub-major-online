export const clientService = {
  async getAll() {
    try {
      // Check if ApperSDK is available
      if (!window.ApperSDK) {
        throw new Error("ApperSDK is not loaded. Please ensure the Apper SDK script is included in your HTML.");
      }

      const { ApperClient } = window.ApperSDK;
      
      // Validate environment variables
      if (!import.meta.env.VITE_APPER_PROJECT_ID) {
        throw new Error("VITE_APPER_PROJECT_ID environment variable is not configured");
      }
      if (!import.meta.env.VITE_APPER_PUBLIC_KEY) {
        throw new Error("VITE_APPER_PUBLIC_KEY environment variable is not configured");
      }

      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "address" } },
          { field: { Name: "property_size" } },
          { field: { Name: "notes" } },
          { field: { Name: "last_contact" } },
          { field: { Name: "status" } },
          { field: { Name: "projects_count" } },
          { field: { Name: "total_revenue" } }
        ]
      };

      const response = await apperClient.fetchRecords('client', params);
      
      if (!response.success) {
        console.error("Apper API Error:", response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching clients:", error);
      if (error.name === 'AxiosError' || error.message.includes('Network Error')) {
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      }
      throw error;
    }
  },

async getById(id) {
    try {
      // Check if ApperSDK is available
      if (!window.ApperSDK) {
        throw new Error("ApperSDK is not loaded. Please ensure the Apper SDK script is included in your HTML.");
      }

      const { ApperClient } = window.ApperSDK;
      
      // Validate environment variables
      if (!import.meta.env.VITE_APPER_PROJECT_ID) {
        throw new Error("VITE_APPER_PROJECT_ID environment variable is not configured");
      }
      if (!import.meta.env.VITE_APPER_PUBLIC_KEY) {
        throw new Error("VITE_APPER_PUBLIC_KEY environment variable is not configured");
      }

      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "email" } },
          { field: { Name: "phone" } },
          { field: { Name: "address" } },
          { field: { Name: "property_size" } },
          { field: { Name: "notes" } },
          { field: { Name: "last_contact" } },
          { field: { Name: "status" } },
          { field: { Name: "projects_count" } },
          { field: { Name: "total_revenue" } }
        ]
      };

      const response = await apperClient.getRecordById('client', parseInt(id), params);
      
      if (!response.success) {
        console.error("Apper API Error:", response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching client with ID ${id}:`, error);
      if (error.name === 'AxiosError' || error.message.includes('Network Error')) {
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      }
      throw error;
    }
  },

async create(clientData) {
    try {
      // Check if ApperSDK is available
      if (!window.ApperSDK) {
        throw new Error("ApperSDK is not loaded. Please ensure the Apper SDK script is included in your HTML.");
      }

      const { ApperClient } = window.ApperSDK;
      
      // Validate environment variables
      if (!import.meta.env.VITE_APPER_PROJECT_ID) {
        throw new Error("VITE_APPER_PROJECT_ID environment variable is not configured");
      }
      if (!import.meta.env.VITE_APPER_PUBLIC_KEY) {
        throw new Error("VITE_APPER_PUBLIC_KEY environment variable is not configured");
      }

      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: clientData.Name,
            email: clientData.email,
            phone: clientData.phone,
            address: clientData.address,
            property_size: clientData.property_size,
            notes: clientData.notes,
            last_contact: clientData.last_contact,
            status: clientData.status || 'active',
            projects_count: 0,
            total_revenue: 0.00
          }
        ]
      };

      const response = await apperClient.createRecord('client', params);
      
      if (!response.success) {
        console.error("Apper API Error:", response.message);
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
      console.error("Error creating client:", error);
      if (error.name === 'AxiosError' || error.message.includes('Network Error')) {
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      }
      throw error;
    }
  },

async update(id, clientData) {
    try {
      // Check if ApperSDK is available
      if (!window.ApperSDK) {
        throw new Error("ApperSDK is not loaded. Please ensure the Apper SDK script is included in your HTML.");
      }

      const { ApperClient } = window.ApperSDK;
      
      // Validate environment variables
      if (!import.meta.env.VITE_APPER_PROJECT_ID) {
        throw new Error("VITE_APPER_PROJECT_ID environment variable is not configured");
      }
      if (!import.meta.env.VITE_APPER_PUBLIC_KEY) {
        throw new Error("VITE_APPER_PUBLIC_KEY environment variable is not configured");
      }

      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...clientData
          }
        ]
      };

      const response = await apperClient.updateRecord('client', params);
      
      if (!response.success) {
        console.error("Apper API Error:", response.message);
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
      console.error("Error updating client:", error);
      if (error.name === 'AxiosError' || error.message.includes('Network Error')) {
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      }
      throw error;
    }
  },

async delete(id) {
    try {
      // Check if ApperSDK is available
      if (!window.ApperSDK) {
        throw new Error("ApperSDK is not loaded. Please ensure the Apper SDK script is included in your HTML.");
      }

      const { ApperClient } = window.ApperSDK;
      
      // Validate environment variables
      if (!import.meta.env.VITE_APPER_PROJECT_ID) {
        throw new Error("VITE_APPER_PROJECT_ID environment variable is not configured");
      }
      if (!import.meta.env.VITE_APPER_PUBLIC_KEY) {
        throw new Error("VITE_APPER_PUBLIC_KEY environment variable is not configured");
      }

      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('client', params);
      
      if (!response.success) {
        console.error("Apper API Error:", response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting client:", error);
      if (error.name === 'AxiosError' || error.message.includes('Network Error')) {
        throw new Error("Network connection failed. Please check your internet connection and try again.");
      }
      throw error;
    }
  }
};