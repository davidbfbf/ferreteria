import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { categoriasApi, productosApi } from '../api';
import FormModal from '../components/FormModal';
import { colors, ui } from '../theme';

const VACIO = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: null };

export default function ProductosScreen({ apiUrl }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState('');
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [prods, cats] = await Promise.all([productosApi.listar(buscar), categoriasApi.listar()]);
      setProductos(prods);
      setCategorias(cats);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [buscar]);

  useEffect(() => {
    const t = setTimeout(cargar, 300);
    return () => clearTimeout(t);
  }, [cargar, apiUrl]);

  function abrirNuevo() {
    if (!categorias.length) {
      Alert.alert('Sin categorías', 'Primero registra al menos una categoría.');
      return;
    }
    setForm({ ...VACIO, id_categoria: categorias[0].id_categoria });
    setEditandoId(null);
    setModal(true);
  }

  function abrirEditar(p) {
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: String(p.precio),
      stock: String(p.stock),
      id_categoria: p.id_categoria,
    });
    setEditandoId(p.id_producto);
    setModal(true);
  }

  async function guardar() {
    if (!form.nombre.trim()) return Alert.alert('Falta el nombre', 'El nombre es obligatorio.');
    const body = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: Number(form.precio.replace(',', '.')),
      stock: Number(form.stock),
      id_categoria: form.id_categoria,
    };
    setGuardando(true);
    try {
      if (editandoId) await productosApi.actualizar(editandoId, body);
      else await productosApi.crear(body);
      setModal(false);
      cargar();
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message);
    } finally {
      setGuardando(false);
    }
  }

  function eliminar(p) {
    Alert.alert('Eliminar producto', `¿Eliminar "${p.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await productosApi.eliminar(p.id_producto);
            cargar();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  }

  const set = (campo) => (v) => setForm((f) => ({ ...f, [campo]: v }));

  const renderItem = ({ item: p }) => (
    <Pressable style={ui.card} onPress={() => abrirEditar(p)} onLongPress={() => eliminar(p)}>
      <View style={styles.row}>
        <Text style={styles.nombre} numberOfLines={2}>{p.nombre}</Text>
        <Text style={styles.precio}>Bs {Number(p.precio).toFixed(2)}</Text>
      </View>
      {!!p.descripcion && <Text style={styles.desc} numberOfLines={2}>{p.descripcion}</Text>}
      <View style={[styles.row, { marginTop: 8 }]}>
        <Text style={styles.chip}>{p.categoria}</Text>
        <Text style={[styles.stock, p.stock <= 5 && { color: colors.danger }]}>Stock: {p.stock}</Text>
      </View>
      <View style={styles.cardActions}>
        <Pressable onPress={() => abrirEditar(p)} hitSlop={8}>
          <Text style={styles.link}>Editar</Text>
        </Pressable>
        <Pressable onPress={() => eliminar(p)} hitSlop={8}>
          <Text style={[styles.link, { color: colors.danger }]}>Eliminar</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={[ui.input, { marginBottom: 10 }]}
        placeholder="Buscar producto…"
        placeholderTextColor={colors.muted}
        value={buscar}
        onChangeText={setBuscar}
      />
      {!!error && <Text style={ui.error}>{error}</Text>}

      {cargando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={(p) => String(p.id_producto)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={ui.empty}>No se encontraron productos</Text>}
          refreshControl={
            <RefreshControl refreshing={refrescando} onRefresh={() => { setRefrescando(true); cargar(); }} />
          }
        />
      )}

      <Pressable style={ui.fab} onPress={abrirNuevo}>
        <Text style={ui.fabText}>+</Text>
      </Pressable>

      <FormModal
        visible={modal}
        titulo={editandoId ? 'Editar producto' : 'Nuevo producto'}
        onClose={() => setModal(false)}
        onSave={guardar}
        guardando={guardando}
      >
        <Text style={ui.label}>Nombre *</Text>
        <TextInput style={ui.input} value={form.nombre} onChangeText={set('nombre')} maxLength={150} />

        <Text style={ui.label}>Descripción</Text>
        <TextInput
          style={[ui.input, { minHeight: 60, textAlignVertical: 'top' }]}
          value={form.descripcion}
          onChangeText={set('descripcion')}
          multiline
          maxLength={255}
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={ui.label}>Precio (Bs) *</Text>
            <TextInput style={ui.input} value={form.precio} onChangeText={set('precio')} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={ui.label}>Stock *</Text>
            <TextInput style={ui.input} value={form.stock} onChangeText={set('stock')} keyboardType="number-pad" />
          </View>
        </View>

        <Text style={ui.label}>Categoría *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {categorias.map((c) => {
            const activa = form.id_categoria === c.id_categoria;
            return (
              <Pressable
                key={c.id_categoria}
                onPress={() => set('id_categoria')(c.id_categoria)}
                style={[styles.opcion, activa && styles.opcionActiva]}
              >
                <Text style={[styles.opcionText, activa && { color: '#fff' }]}>{c.nombre}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  nombre: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  precio: { fontSize: 16, fontWeight: '700', color: colors.primary },
  desc: { color: colors.muted, marginTop: 4 },
  chip: {
    backgroundColor: colors.chipBg, color: colors.chipText, fontSize: 12,
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden',
  },
  stock: { fontWeight: '600', color: colors.text },
  cardActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 22, marginTop: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0EDE8',
  },
  link: { fontWeight: '600', color: colors.steel },
  opcion: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1,
    borderColor: colors.border, backgroundColor: '#fff', marginRight: 8,
  },
  opcionActiva: { backgroundColor: colors.primary, borderColor: colors.primary },
  opcionText: { color: colors.text, fontWeight: '600' },
});
