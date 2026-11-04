import { DEFAULT_API_URL } from './config';

let baseUrl = DEFAULT_API_URL;

export const getApiUrl = () => baseUrl;
export const setApiUrl = (url) => {
  baseUrl = url.trim().replace(/\/+$/, '');
};

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${baseUrl}/api${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const detalle = data.errores ? `\n• ${data.errores.join('\n• ')}` : '';
      throw new Error((data.mensaje || 'Error en la petición') + detalle);
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError' || err.message === 'Network request failed') {
      throw new Error(`No se pudo conectar con la API en ${baseUrl}.\nVerifica la IP y que estés en la misma red.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const categoriasApi = {
  listar: () => request('/categorias'),
  crear: (body) => request('/categorias', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
};

export const productosApi = {
  listar: (buscar = '') => request(`/productos${buscar ? `?buscar=${encodeURIComponent(buscar)}` : ''}`),
  crear: (body) => request('/productos', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
};
