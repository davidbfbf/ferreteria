const { Router } = require('express');
const ctrl = require('../controllers/categorias.controller');

const router = Router();

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtener);
router.get('/:id/productos', ctrl.productosDeCategoria);
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
