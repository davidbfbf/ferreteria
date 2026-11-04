const pool = require('../config/db');

const SELECT_PRODUCTOS = `
  SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
         p.id_categoria, c.nombre AS categoria
    FROM productos p
    INNER JOIN categorias c ON c.id_categoria = p.id_categoria`;

function validar(body) {
  const errores = [];
  const precio = Number(body.precio);
  const stock = Number(body.stock);
  if (!body.nombre || !String(body.nombre).trim()) errores.push('El nombre es obligatorio');
  if (body.precio === undefined || body.precio === '' || Number.isNaN(precio) || precio < 0)
    errores.push('El precio debe ser un número mayor o igual a 0');
  if (body.stock === undefined || body.stock === '' || !Number.isInteger(stock) || stock < 0)
    errores.push('El stock debe ser un entero mayor o igual a 0');
  if (!body.id_categoria) errores.push('La categoría es obligatoria');
  return errores;
}

async function categoriaExiste(id) {
  const [rows] = await pool.query('SELECT 1 FROM categorias WHERE id_categoria = ?', [id]);
  return rows.length > 0;
}

// GET /api/productos  (filtros opcionales: ?buscar=texto&categoria=id)
exports.listar = async (req, res, next) => {
  try {
    const condiciones = [];
    const params = [];
    if (req.query.buscar) {
      condiciones.push('(p.nombre LIKE ? OR p.descripcion LIKE ?)');
      params.push(`%${req.query.buscar}%`, `%${req.query.buscar}%`);
    }
    if (req.query.categoria) {
      condiciones.push('p.id_categoria = ?');
      params.push(req.query.categoria);
    }
    const where = condiciones.length ? ` WHERE ${condiciones.join(' AND ')}` : '';
    const [rows] = await pool.query(`${SELECT_PRODUCTOS}${where} ORDER BY p.nombre`, params);
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/productos/:id
exports.obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`${SELECT_PRODUCTOS} WHERE p.id_producto = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// POST /api/productos
exports.crear = async (req, res, next) => {
  try {
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    const { nombre, descripcion = null, precio, stock, id_categoria } = req.body;
    if (!(await categoriaExiste(id_categoria)))
      return res.status(400).json({ mensaje: 'La categoría indicada no existe' });

    const [result] = await pool.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria) VALUES (?, ?, ?, ?, ?)',
      [nombre.trim(), descripcion, Number(precio), Number(stock), id_categoria]
    );
    const [rows] = await pool.query(`${SELECT_PRODUCTOS} WHERE p.id_producto = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/productos/:id
exports.actualizar = async (req, res, next) => {
  try {
    const errores = validar(req.body);
    if (errores.length) return res.status(400).json({ mensaje: 'Datos inválidos', errores });
    const { nombre, descripcion = null, precio, stock, id_categoria } = req.body;
    if (!(await categoriaExiste(id_categoria)))
      return res.status(400).json({ mensaje: 'La categoría indicada no existe' });

    const [result] = await pool.query(
      `UPDATE productos
          SET nombre = ?, descripcion = ?, precio = ?, stock = ?, id_categoria = ?
        WHERE id_producto = ?`,
      [nombre.trim(), descripcion, Number(precio), Number(stock), id_categoria, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    const [rows] = await pool.query(`${SELECT_PRODUCTOS} WHERE p.id_producto = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/productos/:id
exports.eliminar = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM productos WHERE id_producto = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) { next(err); }
};
