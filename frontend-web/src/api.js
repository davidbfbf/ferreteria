// URL base de la API. Por defecto usa el mismo host desde el que se abrió la web,
// así funciona tanto en el servidor (localhost) como en otro equipo (IP del servidor).
export const API_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detalle = data.errores ? `: ${data.errores.join(', ')}` : '';
    throw new Error((data.mensaje || 'Error en la petición') + detalle);
  }
  return data;
}

export const categoriasApi = {
  listar: () => request('/categorias'),
  crear: (body) => request('/categorias', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => request(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
};

export const productosApi = {
  listar: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/productos${qs ? `?${qs}` : ''}`);
  },
  crear: (body) => request('/productos', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id, body) => request(`/productos/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminar: (id) => request(`/productos/${id}`, { method: 'DELETE' }),
};
