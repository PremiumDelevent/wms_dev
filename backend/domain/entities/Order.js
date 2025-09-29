class Order {
  constructor({ id, num, sellto_customer_name, furniture_load_date_jmt, jmt_status, jmteventname, lineas }) {
    this.id = id;
    this.num = num;
    this.sellto_customer_name = sellto_customer_name;
    this.jmt_status = jmt_status;
    this.furniture_load_date_jmt = furniture_load_date_jmt;
    this.jmteventname = jmteventname;

    // Normaliza líneas
    this.lineas = Array.isArray(lineas)
      ? lineas.map((l) => ({
          producto_id: l.producto_id,
          descripcion: l.descripcion,
          cantidad: l.cantidad,
        }))
      : [];
  }

}

module.exports = Order;