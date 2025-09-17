
function Header() {

  return (
    <header style={{  
            padding: '16px', 
            color: 'black', 
            textAlign: 'center' 
        }}>
            <img src="/logo_premium.svg" alt="WMS Premium Logo" style={{ height: '40px', verticalAlign: 'middle', marginRight: '10px' }} />
            <nav style={{ verticalAlign: 'middle' }}>
                <a href="/" style={{ margin: '0 15px', textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>Home</a>
                <a href="/intercambios" style={{ margin: '0 15px', textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>Intercambios</a>
                <a href="/stock" style={{ margin: '0 15px', textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>Stock</a>
                <a href="/pedidos" style={{ margin: '0 15px', textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>Pedidos</a>
            </nav>
    </header>
  );
}

export default Header;
