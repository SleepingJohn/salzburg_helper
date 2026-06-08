import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

export default function SuccessScreen({ route, navigation }: Props) {
  const { citizenMessage, germanMessage, nativeLanguage, issue, location, department } = route.params;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
        <Text style={styles.title}>Your report was sent successfully.</Text>
        <Text style={styles.subtitle}>Stadt Salzburg will take appropriate action.</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Detected issue</Text>
          <Text style={styles.infoText}>{issue}</Text>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoText}>{location}</Text>
          <Text style={styles.infoLabel}>Department</Text>
          <Text style={styles.infoText}>{department}</Text>
        </View>

        <View style={styles.translatedCard}>
          <Text style={styles.translatedTitle}>Confirmation in {nativeLanguage}</Text>
          <Text style={styles.translatedText}>{citizenMessage}</Text>
          <Text style={styles.germanText}>{germanMessage}</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={[styles.actionButton, styles.trackButton]} onPress={() => navigation.navigate('Tracking')}>
            <Text style={styles.actionText}>Track Issue</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, styles.finishButton]} onPress={() => navigation.popToTop()}>
            <Text style={styles.finishText}>Finish</Text>
          </Pressable>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
  checkmark: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: 28,
    lineHeight: 24,
  },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceStrong,
    marginBottom: 16,
  },
  infoLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  translatedCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(4, 125, 118, 0.22)',
    backgroundColor: 'rgba(4, 125, 118, 0.06)',
    marginBottom: 16,
  },
  translatedTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  translatedText: {
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10,
  },
  germanText: {
    color: theme.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  trackButton: {
    backgroundColor: theme.colors.primary,
  },
  finishButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  finishText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
