import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { routeToAuthority, sendCitizenConfirmation, translateToGerman, transcribeVoice } from '../api/mockAI';
import theme from '../theme';
import { ReportSummary, RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Processing'>;

const steps = [
  { key: 'transcribing', label: 'Transcribing' },
  { key: 'translating', label: 'Translating' },
  { key: 'routing', label: 'Finding City Department' },
];

export default function ProcessingScreen({ route, navigation }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [germanMessage, setGermanMessage] = useState('');
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTranscript, setDraftTranscript] = useState('');
  const [isRefreshingSummary, setIsRefreshingSummary] = useState(false);

  useEffect(() => {
    let mounted = true;

    const runSteps = async () => {
      const voiceTranscript = await transcribeVoice(route.params.mockTranscript);
      if (!mounted) {
        return;
      }
      setTranscript(voiceTranscript);
      setDraftTranscript(voiceTranscript);
      setCurrentStep(1);

      const translatedMessage = await translateToGerman(voiceTranscript);
      if (!mounted) {
        return;
      }
      setGermanMessage(translatedMessage);
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
    navigation.replace('Success', {
      citizenMessage: confirmation.citizenMessage,
      germanMessage: confirmation.germanMessage,
      issue: summary.issue,
      location: summary.location,
      department: summary.department,
      nativeLanguage: route.params.nativeLanguage,
    });
  };

  const handleSaveEdit = async () => {
    const cleanedTranscript = draftTranscript.trim();

    if (!cleanedTranscript) {
      return;
    }

    setIsRefreshingSummary(true);
    setTranscript(cleanedTranscript);
    const translatedMessage = await translateToGerman(cleanedTranscript);
    setGermanMessage(translatedMessage);
    const result = await routeToAuthority(translatedMessage);
    setSummary(result);
    setIsEditing(false);
    setIsRefreshingSummary(false);
  };

  const handleCancelEdit = () => {
    setDraftTranscript(transcript);
    setIsEditing(false);
  };

  const readyToSend = currentStep === steps.length && summary !== null && !isEditing && !isRefreshingSummary;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{readyToSend ? 'Review Report' : 'AI Processing'}</Text>
          <Text style={styles.subtitle}>
            {readyToSend
              ? 'Please review the transcription before sending it to Stadt Salzburg.'
              : 'We are analyzing your report and preparing it for the right department.'}
          </Text>

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

          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultLabel}>Voice transcription</Text>
              {readyToSend && (
                <Pressable
                  style={styles.editButton}
                  onPress={() => {
                    setDraftTranscript(transcript);
                    setIsEditing(true);
                  }}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </Pressable>
              )}
            </View>

            {isEditing ? (
              <>
                <TextInput
                  style={styles.transcriptInput}
                  value={draftTranscript}
                  onChangeText={setDraftTranscript}
                  multiline
                  autoFocus
                  placeholder="Correct the transcription"
                  placeholderTextColor={theme.colors.muted}
                />
                <View style={styles.editActions}>
                  <Pressable style={[styles.smallButton, styles.cancelButton]} onPress={handleCancelEdit}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.smallButton, styles.saveButton, !draftTranscript.trim() && styles.disabledSmallButton]}
                    disabled={!draftTranscript.trim() || isRefreshingSummary}
                    onPress={handleSaveEdit}
                  >
                    <Text style={styles.saveButtonText}>{isRefreshingSummary ? 'Updating...' : 'Save'}</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <Text style={styles.resultText}>{transcript || 'Listening to the recorded message...'}</Text>
            )}
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Mock AI Summary</Text>
            <Text style={styles.summaryText}>Issue: {isRefreshingSummary ? 'Updating...' : summary?.issue ?? '...'}</Text>
            <Text style={styles.summaryText}>Location: {summary?.location ?? '...'}</Text>
            <Text style={styles.summaryText}>
              Department: {isRefreshingSummary ? 'Updating...' : summary?.department ?? '...'}
            </Text>
          </View>

          <Pressable
            style={[styles.continueButton, (!readyToSend || isSending) && styles.continueButtonDisabled]}
            disabled={!readyToSend || isSending}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>
              {isRefreshingSummary ? 'Updating report...' : isSending ? 'Sending...' : 'Continue'}
            </Text>
          </Pressable>
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
    padding: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 26,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    lineHeight: 24,
    marginBottom: 30,
  },
  steps: {
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: theme.colors.surface,
  },
  stepDotActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  stepLabel: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  stepLabelActive: {
    color: '#fff',
  },
  stepText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  resultCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    marginBottom: 14,
  },
  resultLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  editButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  transcriptInput: {
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 14,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  smallButton: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  disabledSmallButton: {
    opacity: 0.55,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.text,
    marginBottom: 6,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 22,
  },
  continueButtonDisabled: {
    opacity: 0.55,
  },
  continueText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
});
