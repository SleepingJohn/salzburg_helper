import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, Text, View, Pressable } from 'react-native';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.card}>
        <View style={styles.branding}>
          <View style={styles.brandMark} />
          <Text style={styles.brandText}>Stadt Salzburg</Text>
        </View>

        <Text style={styles.headline}>Report a Problem Nearby</Text>
        <Text style={styles.subtitle}>Speak in any language and the city will understand.</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Smart multilingual civic reporting</Text>
          <Text style={styles.heroBody}>
            Scan the QR code, speak naturally, and receive confirmation in your language.
          </Text>
        </View>

        <Pressable style={styles.button} onPress={() => navigation.navigate('Record')}>
          <Text style={styles.buttonText}>Start Report</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    marginRight: 12,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  headline: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.colors.text,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    maxWidth: '90%',
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 22,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 8,
  },
  heroBody: {
    fontSize: 15,
    color: theme.colors.muted,
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
