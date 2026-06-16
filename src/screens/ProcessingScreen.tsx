import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { routeToAuthority, sendCitizenConfirmation, translateToGerman, transcribeVoice } from '../api/mockAI';
import { updateReport } from '../data/reports';
import { ReportSummary, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

const citizenGreen = '#2E7F18';
const brandRed = '#A20B0B';

const steps = [
  { key: 'transcribing', label: 'Transcribing' },
  { key: 'translating', label: 'Translating' },
  { key: 'routing', label: 'Finding City Department' },
];

export default function ProcessingScreen({ route, navigation }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    const runSteps = async () => {
      const voiceTranscript = await transcribeVoice(route.params.mockTranscript);
      if (!mounted) {
        return;
      }
      setCurrentStep(1);

      const translatedMessage = await translateToGerman(voiceTranscript);
      if (!mounted) {
        return;
      }
      setCurrentStep(2);

      const result = await routeToAuthority(translatedMessage);
      if (!mounted) {
        return;
      }
      setSummary(result);
      setCurrentStep(3);
    };

    runSteps();

    return () => {
      mounted = false;
    };
  }, [route.params.mockTranscript]);

  const handleContinue = async () => {
    if (!summary || isSending) {
      return;
    }

    setIsSending(true);
    const confirmation = await sendCitizenConfirmation(summary);
    updateReport('SAL - 2026 - 00124', {
      title: route.params.issueTitle,
      issue: summary.issue,
      department: summary.department,
      status: 'received',
      location: summary.location === 'Auto-detected' ? 'Faberstrasse 10, 5020 Salzburg' : summary.location,
      citizenMessage: route.params.mockTranscript,
    });
    navigation.replace('Success', {
      citizenMessage: confirmation.citizenMessage,
      germanMessage: confirmation.germanMessage,
      issue: summary.issue,
      location: summary.location,
      department: summary.department,
      nativeLanguage: route.params.nativeLanguage,
    });
  };

  const readyToSend = currentStep === steps.length && summary !== null;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()} accessibilityLabel="Back">
          <MaterialCommunityIcons name="arrow-left" size={20} color={citizenGreen} />
        </Pressable>

        <View style={styles.brandBlock}>
          <Text style={styles.brandText}>
            <Text style={styles.brandAccent}>Salz</Text>Citizen
          </Text>
          <Text style={styles.brandSubtext}>Salzburg. We listen</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{readyToSend ? 'Review Report' : 'Preparing Report'}</Text>
          <Text style={styles.subtitle}>We are preparing your issue for the right city department.</Text>

          <View style={styles.steps}>
            {steps.map((step, index) => (
              <View key={step.key} style={styles.stepRow}>
                <View style={[styles.stepDot, index < currentStep ? styles.stepDotActive : null]}>
                  <Text style={[styles.stepLabel, index < currentStep ? styles.stepLabelActive : null]}>
                    {index < currentStep ? '✓' : index + 1}
                  </Text>
                </View>
                <Text style={styles.stepText}>{step.label}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Report Summary</Text>
            <Text style={styles.summaryText}>Title: {route.params.issueTitle}</Text>
            <Text style={styles.summaryText}>Issue: {summary?.issue ?? '...'}</Text>
            <Text style={styles.summaryText}>Location: {summary?.location ?? '...'}</Text>
            <Text style={styles.summaryText}>Department: {summary?.department ?? '...'}</Text>
          </View>

          <Pressable
            style={[styles.continueButton, (!readyToSend || isSending) && styles.continueButtonDisabled]}
            disabled={!readyToSend || isSending}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>{isSending ? 'Sending...' : 'Continue'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 64,
    paddingBottom: 36,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 54,
  },
  brandText: {
    color: '#000',
    fontSize: 25,
    fontWeight: '800',
  },
  brandAccent: {
    color: brandRed,
  },
  brandSubtext: {
    color: '#d3d1d1',
    fontSize: 12,
    marginTop: 5,
  },
  card: {
    gap: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  subtitle: {
    fontSize: 13,
    color: '#8c8c8c',
    lineHeight: 20,
    fontWeight: '500',
  },
  steps: {
    gap: 18,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8b7f7f',
  },
  stepDotActive: {
    backgroundColor: citizenGreen,
    borderColor: citizenGreen,
  },
  stepLabel: {
    color: '#000',
    fontWeight: '700',
  },
  stepLabelActive: {
    color: '#fff',
  },
  stepText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    padding: 18,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#8c8c8c',
    marginBottom: 6,
    fontWeight: '500',
  },
  continueButton: {
    height: 46,
    backgroundColor: brandRed,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    opacity: 0.55,
  },
  continueText: {
    color: '#fdfbfb',
    fontSize: 15,
    fontWeight: '600',
  },
});
