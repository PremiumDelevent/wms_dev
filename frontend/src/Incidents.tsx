function Incidents() {

  return (
    <div className="container-1">
      <h1>Incidents - WMS PREMIUM DELEVENT</h1>
      <table border={1} cellPadding={5} cellSpacing={0}>
          <thead>
            <tr>
              <th>Número</th>
              <th>Cliente</th>
              <th>Evento</th>
              <th>Fecha carga</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
        </table>
    </div>
  );
}

export default Incidents;
