const pool = require('../config/db');

function validar(body) {
  const errores = [];
  if (!body.nombre || !String(body.nombre).trim()) errores.push('El nombre es obligatorio');
  if (body.nombre && String(body.nombre).length > 100) errores.push('El nombre admite máximo 100 caracteres');
  return errores;
}

// GET /api/categorias
exports.listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id_categoria, c.nombre, c.descripcion,
              COUNT(p.id_producto) AS total_productos
         FROM categorias c
         LEFT JOIN productos p ON p.id_categoria = c.id_categoria
        GROUP BY c.id_categoria
        ORDER BY c.nombre`
    );
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/categorias/:id
exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias WHERE id_categoria = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// GET /api/categorias/:id/productos
exports.productosDeCategoria = async (req, res, next) => {
  try {
    const [cat] = await pool.query('SELECT id_categoria FROM categorias WHERE id_categoria = ?', [req.params.id]);
    if (!cat.length) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    const [rows] = await pool.query('SELECT * FROM productos WHERE id_categoria = ? ORDER BY nombre', [req.params.id]);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/categorias
exports.crear = async (req, res, next) => {
  try {
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    const { nombre, descripcion = null } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)',
      [nombre.trim(), descripcion]
    );
    res.status(201).json({ id_categoria: result.insertId, nombre: nombre.trim(), descripcion });
  } catch (err) { next(err); }
};

// PUT /api/categorias/:id
exports.actualizar = async (req, res, next) => {
  try {
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    const { nombre, descripcion = null } = req.body;
    const [result] = await pool.query(
      'UPDATE categorias SET nombre = ?, descripcion = ? WHERE id_categoria = ?',
      [nombre.trim(), descripcion, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json({ id_categoria: Number(req.params.id), nombre: nombre.trim(), descripcion });
  } catch (err) { next(err); }
};

// DELETE /api/categorias/:id
exports.eliminar = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM categorias WHERE id_categoria = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) { next(err); }
};
