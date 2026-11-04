import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ProductosScreen from './src/screens/ProductosScreen';
import CategoriasScreen from './src/screens/CategoriasScreen';
import FormModal from './src/components/FormModal';
import { getApiUrl, setApiUrl } from './src/api';
import { colors, ui } from './src/theme';

export default function App() {
  const [tab, setTab] = useState('productos');
  const [apiUrl, setApiUrlState] = useState(getApiUrl());
  const [config, setConfig] = useState(false);
  const [urlEdit, setUrlEdit] = useState(apiUrl);

  function guardarUrl() {
    if (!/^https?:\/\/.+/.test(urlEdit.trim())) {
      Alert.alert('URL inválida', 'Usa el formato http://192.168.x.x:3000');
      return;
    }
    setApiUrl(urlEdit);
    setApiUrlState(getApiUrl());
    setConfig(false);
  }

  return (
    <SafeAreaProvider>
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>⚒ Ferretería</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{apiUrl}</Text>
        </View>
        <Pressable
          onPress={() => { setUrlEdit(apiUrl); setConfig(true); }}
          style={styles.gear}
          hitSlop={10}
        >
          <Text style={{ color: '#fff', fontSize: 20 }}>⚙</Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        {[
          ['productos', 'Productos'],
          ['categorias', 'Categorías'],
        ].map(([key, label]) => (
          <Pressable key={key} style={[styles.tab, tab === key && styles.tabActive]} onPress={() => setTab(key)}>
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.body}>
        {tab === 'productos' ? <ProductosScreen apiUrl={apiUrl} /> : <CategoriasScreen apiUrl={apiUrl} />}
      </View>

      <FormModal
        visible={config}
        titulo="Servidor de la API"
        onClose={() => setConfig(false)}
        onSave={guardarUrl}
      >
        <Text style={ui.label}>URL del servidor (IP de la computadora)</Text>
        <TextInput
          style={ui.input}
          value={urlEdit}
          onChangeText={setUrlEdit}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholder="http://192.168.1.10:3000"
        />
        <Text style={{ color: colors.muted, marginTop: 8, fontSize: 13 }}>
          El celular debe estar en la misma red Wi-Fi que el servidor.
        </Text>
      </FormModal>
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.steel },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12,
  },
  title: { color: '#fff', fontSize: 21, fontWeight: '700' },
  subtitle: { color: '#C5CCD3', fontSize: 12, marginTop: 2 },
  gear: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10,
  },
  tab: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: '#D5DBE0', fontWeight: '600' },
  tabTextActive: { color: colors.steel },
  body: { flex: 1, backgroundColor: colors.bg, padding: 14, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
});
