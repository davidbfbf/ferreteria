import { useEffect, useState } from 'react';
import { categoriasApi } from '../api.js';
import Modal from './Modal.jsx';

const VACIO = { nombre: '', descripcion: '' };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      setCategorias(await categoriasApi.listar());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  function mostrarAviso(msg) {
    setAviso(msg);
    setTimeout(() => setAviso(''), 2500);
  }

  function abrirNuevo() {
    setForm(VACIO);
    setEditandoId(null);
    setModalAbierto(true);
  }

  function abrirEditar(c) {
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setEditandoId(c.id_categoria);
    setModalAbierto(true);
  }

  async function guardar(e) {
    e.preventDefault();
    try {
      if (editandoId) {
        await categoriasApi.actualizar(editandoId, form);
        mostrarAviso('Categoría actualizada');
      } else {
        await categoriasApi.crear(form);
        mostrarAviso('Categoría registrada');
      }
      setModalAbierto(false);
      cargar();
    } catch (err) {
      alert(err.message);
    }
  }

  async function eliminar(c) {
    if (!confirm(`¿Eliminar la categoría "${c.nombre}"?`)) return;
    try {
      await categoriasApi.eliminar(c.id_categoria);
      mostrarAviso('Categoría eliminada');
      cargar();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <section>
      <div className="toolbar">
        <h2>Categorías <span className="count">{categorias.length}</span></h2>
        <button className="btn primary" onClick={abrirNuevo}>+ Nueva categoría</button>
      </div>

      {aviso && <div className="toast">{aviso}</div>}
      {error && <div className="alert">No se pudo conectar con la API: {error}</div>}

      {cargando ? (
        <p className="muted">Cargando…</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th className="num">Productos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.id_categoria}>
                  <td className="muted">{c.id_categoria}</td>
                  <td className="strong">{c.nombre}</td>
                  <td>{c.descripcion}</td>
                  <td className="num">{c.total_productos}</td>
                  <td className="actions">
                    <button className="btn small" onClick={() => abrirEditar(c)}>Editar</button>
                    <button className="btn small danger" onClick={() => eliminar(c)}>Eliminar</button>
                  </td>
                </tr>
              ))}
              {!categorias.length && (
                <tr><td colSpan="5" className="empty">No hay categorías registradas</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modalAbierto && (
        <Modal titulo={editandoId ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={guardar} className="form">
            <label>
              Nombre *
              <input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                maxLength={100}
                required
                autoFocus
              />
            </label>
            <label>
              Descripción
              <textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                maxLength={255}
                rows={3}
              />
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
