class Product {
    constructor({ id, name, category, stock, available }) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.stock = typeof stock === "number" ? stock : 0;
      this.available = typeof available === "number" ? available : 0;
    }
}
  
module.exports = Product;