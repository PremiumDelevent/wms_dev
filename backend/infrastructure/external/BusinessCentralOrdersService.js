const axios = require("axios");
const Order = require("../../domain/entities/Order");

class BusinessCentralOrdersService {
  constructor() {
    this.companyId = process.env.BC_COMPANY_ID;
    this.token = null;
    this.tenant = process.env.TENANT_ID;
    this.environment = process.env.BC_ENVIRONMENT;
    this.clientId = process.env.CLIENT_ID;
    this.clientSecret = process.env.CLIENT_SECRET;
  }

  async getBcAccessToken() {
    const url = `https://login.microsoftonline.com/${this.tenant}/oauth2/v2.0/token`;
    try {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      params.append("client_id", this.clientId);
      params.append("client_secret", this.clientSecret);
      params.append("scope", "https://api.businesscentral.dynamics.com/.default");
  
      const response = await axios.post(url, params);
      return response.data.access_token || null;
    } catch (error) {
      console.error("❌ Error obteniendo access_token:", error.response?.data || error.message);
      return null;
    }
  }

  async fetchOrders() {
    try {
      const token = await this.getBcAccessToken();

      const url = `https://api.businesscentral.dynamics.com/v2.0/3283f487-58a3-41e8-8fce-4b83155bc6f8/PRODUCTION/api/BDOSpain/laukatu/v1.0/companies(b78acfed-0a57-eb11-89fa-000d3a47e0e0)/LKSalesOrders?$expand=lines`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      });

        const orders = response.data.value || [];

        return orders.map((o) => {
            const lineas = (o.lines || []).map((line) => ({
                producto_id: line.no || line.No || null,
                descripcion: line.description || "",
                cantidad: line.quantity || 0
            }));

            return new Order({
                num: o.No || o.Document_No || o.documentNo || "SIN_DOC",
                sellto_customer_name: o.SelltoCustomerName || "SIN_NOMBRE",
                furniture_load_date_jmt: o.furnitureLoadDateJMT ? new Date(o.furnitureLoadDateJMT) : null,
                jmt_status: o.jmtStatus || "",
                jmteventname: o.jmtEventName || "",
                lineas
            });
        });
    } catch (err) {
      console.error("❌ [BC] Error fetching orders:", err.message);
      return [];
    }
  }
}

module.exports = BusinessCentralOrdersService;
