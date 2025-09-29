const axios = require("axios");
const Product = require("../../domain/entities/Product");

class BusinessCentralProductsService {
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

  async fetchProducts() {
    try {
      const token = await this.getBcAccessToken();

      const url = `https://api.businesscentral.dynamics.com/v2.0/${this.tenant}/${this.environment}/api/v2.0/companies(${this.companyId})/items`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      });

        const products = response.data.value || [];

        return products.map((p) => {

            return new Product({
                id: p.number || "SIN_ID",
                name: p.displayName || "SIN_NOMBRE",
                category: p.itemCategoryCode || "",
                stock: 0,
            });
        });
    } catch (err) {
      console.error("❌ [BC] Error fetching products:", err.message);
      return [];
    }
  }
}

module.exports = BusinessCentralProductsService;
