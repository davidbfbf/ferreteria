import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { categoriasApi } from '../api';
import FormModal from '../components/FormModal';
import { colors, ui } from '../theme';

const VACIO = { nombre: '', descripcion: '' };

export default function CategoriasScreen({ apiUrl }) {
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [modal, setModal] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setCategorias(await categoriasApi.listar());
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar, apiUrl]);

  function abrirNuevo() {
    setForm(VACIO);
    setEditandoId(null);
    setModal(true);
  }

  function abrirEditar(c) {
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '' });
    setEditandoId(c.id_categoria);
    setModal(true);
  }

  async function guardar() {
    if (!form.nombre.trim()) return Alert.alert('Falta el nombre', 'El nombre es obligatorio.');
    setGuardando(true);
    try {
      if (editandoId) await categoriasApi.actualizar(editandoId, form);
      else await categoriasApi.crear(form);
      setModal(false);
      cargar();
    } catch (e) {
      Alert.alert('No se pudo guardar', e.message);
    } finally {
      setGuardando(false);
    }
  }

  function eliminar(c) {
    Alert.alert('Eliminar categoría', `¿Eliminar "${c.nombre}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoriasApi.eliminar(c.id_categoria);
            cargar();
          } catch (e) {
            Alert.alert('No se pudo eliminar', e.message);
          }
        },
      },
    ]);
  }

  const renderItem = ({ item: c }) => (
    <Pressable style={ui.card} onPress={() => abrirEditar(c)} onLongPress={() => eliminar(c)}>
      <View style={styles.row}>
        <Text style={styles.nombre}>{c.nombre}</Text>
        <Text style={styles.badge}>{c.total_productos} prod.</Text>
      </View>
      {!!c.descripcion && <Text style={styles.desc}>{c.descripcion}</Text>}
      <View style={styles.cardActions}>
        <Pressable onPress={() => abrirEditar(c)} hitSlop={8}>
          <Text style={styles.link}>Editar</Text>
        </Pressable>
        <Pressable onPress={() => eliminar(c)} hitSlop={8}>
          <Text style={[styles.link, { color: colors.danger }]}>Eliminar</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1 }}>
      {!!error && <Text style={ui.error}>{error}</Text>}
      {cargando ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={categorias}
          keyExtractor={(c) => String(c.id_categoria)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={ui.empty}>No hay categorías registradas</Text>}
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
        titulo={editandoId ? 'Editar categoría' : 'Nueva categoría'}
        onClose={() => setModal(false)}
        onSave={guardar}
        guardando={guardando}
      >
        <Text style={ui.label}>Nombre *</Text>
        <TextInput
          style={ui.input}
          value={form.nombre}
          onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))}
          maxLength={100}
        />
        <Text style={ui.label}>Descripción</Text>
        <TextInput
          style={[ui.input, { minHeight: 70, textAlignVertical: 'top' }]}
          value={form.descripcion}
          onChangeText={(v) => setForm((f) => ({ ...f, descripcion: v }))}
          multiline
          maxLength={255}
        />
      </FormModal>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  nombre: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  badge: {
    backgroundColor: colors.border, color: colors.muted, fontSize: 12, fontWeight: '600',
    paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden',
  },
  desc: { color: colors.muted, marginTop: 4 },
  cardActions: {
    flexDirection: 'row', justifyContent: 'flex-end', gap: 22, marginTop: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F0EDE8',
  },
  link: { fontWeight: '600', color: colors.steel },
});
