class Product {
    constructor({ id, name, category, stock }) {
      this.id = id;
      this.name = name;
      this.category = category;
      this.stock = typeof stock === "number" ? stock : 0;
    }
}
  
module.exports = Product;