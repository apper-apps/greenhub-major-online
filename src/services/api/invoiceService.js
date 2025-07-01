export const invoiceService = {
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
          { field: { Name: "invoice_number" } },
          { field: { Name: "subtotal" } },
          { field: { Name: "tax" } },
          { field: { Name: "total" } },
          { field: { Name: "status" } },
          { field: { Name: "issue_date" } },
          { field: { Name: "due_date" } },
          { field: { Name: "paid_date" } },
          { field: { Name: "notes" } },
          { field: { Name: "signing_link" } },
          { field: { Name: "project_id" } },
          { field: { Name: "client_id" } }
        ]
      };

      const response = await apperClient.fetchRecords('invoice', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching invoices:", error);
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
          { field: { Name: "invoice_number" } },
          { field: { Name: "subtotal" } },
          { field: { Name: "tax" } },
          { field: { Name: "total" } },
          { field: { Name: "status" } },
          { field: { Name: "issue_date" } },
          { field: { Name: "due_date" } },
          { field: { Name: "paid_date" } },
          { field: { Name: "notes" } },
          { field: { Name: "signing_link" } },
          { field: { Name: "project_id" } },
          { field: { Name: "client_id" } }
        ]
      };

      const response = await apperClient.getRecordById('invoice', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching invoice with ID ${id}:`, error);
      throw error;
    }
  },

  async create(invoiceData) {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: invoiceData.Name || `Invoice ${Date.now()}`,
            invoice_number: invoiceData.invoice_number || `INV-${Date.now()}`,
            subtotal: invoiceData.subtotal || 0,
            tax: invoiceData.tax || 0,
            total: invoiceData.total,
            status: 'draft',
            issue_date: invoiceData.issue_date || new Date().toISOString().split('T')[0],
            due_date: invoiceData.due_date,
            notes: invoiceData.notes,
            project_id: parseInt(invoiceData.project_id) || null,
            client_id: parseInt(invoiceData.client_id)
          }
        ]
      };

      const response = await apperClient.createRecord('invoice', params);
      
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
      console.error("Error creating invoice:", error);
      throw error;
    }
  },

  async update(id, invoiceData) {
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
            ...invoiceData
          }
        ]
      };

      const response = await apperClient.updateRecord('invoice', params);
      
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
      console.error("Error updating invoice:", error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    return this.update(id, { status });
  },

  async generateSigningLink(id) {
    try {
      const { nanoid } = await import('nanoid');
      const signingLink = `${window.location.origin}/sign/invoice/${nanoid(32)}`;
      
      const updated = await this.update(id, { signing_link: signingLink });
      
      return {
        signingLink,
        invoice: updated
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

      const response = await apperClient.deleteRecord('invoice', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }
};