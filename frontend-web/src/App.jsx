import { useState } from 'react';
import Productos from './components/Productos.jsx';
import Categorias from './components/Categorias.jsx';
import { API_URL } from './api.js';

export default function App() {
  const [tab, setTab] = useState('productos');

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">⚒</span>
          <div>
            <h1>Ferretería</h1>
            <small>Gestión de productos y categorías</small>
          </div>
        </div>
        <nav className="tabs">
          <button className={tab === 'productos' ? 'active' : ''} onClick={() => setTab('productos')}>
            Productos
          </button>
          <button className={tab === 'categorias' ? 'active' : ''} onClick={() => setTab('categorias')}>
            Categorías
          </button>
        </nav>
      </header>

      <main className="content">
        {tab === 'productos' ? <Productos /> : <Categorias />}
      </main>

      <footer className="footer">API: {API_URL}</footer>
    </div>
  );
}
