import { useEffect, useState } from 'react';
import { categoriasApi, productosApi } from '../api.js';
import Modal from './Modal.jsx';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '' };
const bs = (n) => `Bs ${Number(n).toFixed(2)}`;

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const [prods, cats] = await Promise.all([
        productosApi.listar({ buscar, categoria: filtroCat }),
        categoriasApi.listar(),
      ]);
      setProductos(prods);
      setCategorias(cats);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  // Recarga al cambiar filtros (con pequeño retardo para la búsqueda)
  useEffect(() => {
    const t = setTimeout(cargar, 250);
    return () => clearTimeout(t);
  }, [buscar, filtroCat]);

  function mostrarAviso(msg) {
    setAviso(msg);
    setTimeout(() => setAviso(''), 2500);
  }

  function abrirNuevo() {
    setForm({ ...VACIO, id_categoria: categorias[0]?.id_categoria ?? '' });
    setEditandoId(null);
    setModalAbierto(true);
  }

  function abrirEditar(p) {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio,
      stock: p.stock,
      id_categoria: p.id_categoria,
    });
    setEditandoId(p.id_producto);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    const body = {
      ...form,
      precio: Number(form.precio),
      stock: Number(form.stock),
      id_categoria: Number(form.id_categoria),
    };
    try {
      if (editandoId) {
        await productosApi.actualizar(editandoId, body);
        mostrarAviso('Producto actualizado');
      } else {
        await productosApi.crear(body);
        mostrarAviso('Producto registrado');
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  }

  async function eliminar(p) {
    if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
    try {
      await productosApi.eliminar(p.id_producto);
      mostrarAviso('Producto eliminado');
      cargar();
    } catch (err) {
      alert(err.message);
    }
  }

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  return (
    <section>
      <div className="toolbar">
        <h2>Productos <span className="count">{productos.length}</span></h2>
        <div className="filters">
          <input
            className="search"
            placeholder="Buscar producto…"
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
          />
          <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
          <button className="btn primary" onClick={abrirNuevo} disabled={!categorias.length}>
            + Nuevo producto
          </button>
        </div>
      </div>

      {aviso && <div className="toast">{aviso}</div>}
      {error && <div className="alert">No se pudo conectar con la API: {error}</div>}

      {cargando && !productos.length ? (
        <p className="muted">Cargando…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th className="num">Precio</th>
                <th className="num">Stock</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id_producto}>
                  <td className="muted">{p.id_producto}</td>
                  <td className="strong">{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td><span className="chip">{p.categoria}</span></td>
                  <td className="num">{bs(p.precio)}</td>
                  <td className="num">
                    <span className={p.stock <= 5 ? 'stock low' : 'stock'}>{p.stock}</span>
                  </td>
                  <td className="actions">
                    <button className="btn small" onClick={() => abrirEditar(p)}>Editar</button>
                    <button className="btn small danger" onClick={() => eliminar(p)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {!productos.length && (
                <tr><td colSpan="7" className="empty">No se encontraron productos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <Modal titulo={editandoId ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={guardar} className="form">
            <label>
              Nombre *
              <input value={form.nombre} onChange={set('nombre')} maxLength={150} required autoFocus />
            </label>
            <label>
              Descripción
              <textarea value={form.descripcion} onChange={set('descripcion')} maxLength={255} rows={2} />
            </label>
            <div className="row">
              <label>
                Precio (Bs) *
                <input type="number" min="0" step="0.01" value={form.precio} onChange={set('precio')} required />
              </label>
              <label>
                Stock *
                <input type="number" min="0" step="1" value={form.stock} onChange={set('stock')} required />
              </label>
            </div>
            <label>
              Categoría *
              <select value={form.id_categoria} onChange={set('id_categoria')} required>
                {categorias.map((c) => (
                  <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => setModalAbierto(false)}>Cancelar</button>
              <button type="submit" className="btn primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
