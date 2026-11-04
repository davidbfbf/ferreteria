import {
  KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { colors, ui } from '../theme';

// Hoja inferior reutilizable para los formularios de alta/edición
export default function FormModal({ visible, titulo, onClose, onSave, guardando, children }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>{titulo}</Text>
          <ScrollView keyboardShouldPersistTaps="handled">{children}</ScrollView>
          <View style={styles.actions}>
            <Pressable style={[ui.btn, { flex: 1 }]} onPress={onClose}>
              <Text style={ui.btnText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[ui.btn, ui.btnPrimary, { flex: 1, opacity: guardando ? 0.6 : 1 }]}
              onPress={onSave}
              disabled={guardando}
            >
              <Text style={[ui.btnText, ui.btnTextPrimary]}>{guardando ? 'Guardando…' : 'Guardar'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(20,24,28,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    paddingBottom: 28,
    maxHeight: '88%',
  },
  title: { fontSize: 19, fontWeight: '700', color: colors.text, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 18 },
});
