import { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AnimatedWaveform from '../components/AnimatedWaveform';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Record'>;

type SpeechRecognitionEvent = {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return null;
  }

  const browserWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null;
};

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const secs = value % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function RecordScreen({ navigation }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Auto-detected near QR code');
  const [notes, setNotes] = useState('');
  const [speechSupported] = useState(() => getSpeechRecognition() !== null);
  const [speechStatus, setSpeechStatus] = useState(
    speechSupported ? 'Ready for voice recognition' : 'Voice input is simulated on this device',
  );
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognition = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (recording) {
      interval.current = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [recording]);

  useEffect(() => {
    return () => {
      recognition.current?.stop();
    };
  }, []);

  const startRecording = () => {
    const SpeechRecognition = getSpeechRecognition();

    setRecording(true);
    setHasRecording(false);
    setSeconds(0);
    setVoiceMessage('');
    setSpeechStatus('Recording...');

    if (!SpeechRecognition) {
      setSpeechStatus('No browser voice recognition available. Type the transcript below.');
      return;
    }

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = 'en-US';
    recognizer.onresult = event => {
      let transcript = '';

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }

      setVoiceMessage(transcript.trim());
      setSpeechStatus('Listening...');
    };
    recognizer.onerror = () => {
      setSpeechStatus('Voice recognition failed. Type or edit the transcript below.');
      setRecording(false);
      setHasRecording(true);
    };
    recognizer.onend = () => {
      setRecording(false);
      setHasRecording(true);
      setSpeechStatus('Recording stopped. Review or edit the transcript.');
    };

    recognition.current = recognizer;
    recognizer.start();
  };

  const stopRecording = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    recognition.current?.stop();
    recognition.current = null;
    setRecording(false);
    setHasRecording(true);
    setSpeechStatus('Recording stopped. Review or edit the transcript.');
  };

  const discardRecording = () => {
    recognition.current?.stop();
    recognition.current = null;
    setRecording(false);
    setHasRecording(false);
    setSeconds(0);
    setVoiceMessage('');
    setSpeechStatus(speechSupported ? 'Ready for voice recognition' : 'Voice input is simulated on this device');
  };

  const canContinue = hasRecording && voiceMessage.trim().length > 0;
  const recordingState = recording ? 'Recording' : hasRecording ? 'Recorded' : 'No recording';

  const continueToReview = () => {
    const context = [voiceMessage.trim(), location.trim() ? `Location: ${location.trim()}` : '', notes.trim()]
      .filter(Boolean)
      .join('\n');

    navigation.navigate('Processing', {
      nativeLanguage: 'English',
      mockTranscript: context,
    });
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View>
            <Text style={styles.eyebrow}>Active QR: Salzburg city service point</Text>
            <Text style={styles.title}>Record your civic report</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, recording && styles.statusDotRecording]} />
            <Text style={styles.statusText}>
              {recordingState} | {formatTime(seconds)}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.formGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reporter name</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Optional" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Optional"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Optional" />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput style={styles.input} value={location} onChangeText={setLocation} />
            </View>
          </View>

          <View style={styles.notesGroup}>
            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="Optional details for the city"
              textAlignVertical="top"
            />
          </View>

          <View style={styles.recorderBox}>
            <Text style={styles.speechStatus}>{speechStatus}</Text>
            <AnimatedWaveform active={recording} />
            <View style={styles.controls}>
              <Pressable
                style={[styles.primaryButton, recording && styles.buttonDisabled]}
                disabled={recording}
                onPress={startRecording}
              >
                <Text style={styles.primaryButtonText}>● Start</Text>
              </Pressable>
              <Pressable
                style={[styles.dangerButton, !recording && styles.buttonDisabled]}
                disabled={!recording}
                onPress={stopRecording}
              >
                <Text style={styles.primaryButtonText}>■ Stop</Text>
              </Pressable>
              <Pressable
                style={[styles.iconButton, (!hasRecording || recording) && styles.buttonDisabled]}
                disabled={!hasRecording || recording}
                onPress={discardRecording}
              >
                <Text style={styles.iconButtonText}>↻</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.transcriptBox}>
            <Text style={styles.inputLabel}>{speechSupported ? 'Recognized voice message' : 'Demo voice message'}</Text>
            <TextInput
              style={[styles.input, styles.transcriptInput]}
              value={voiceMessage}
              onChangeText={setVoiceMessage}
              multiline
              placeholder="Say or type the message here"
              placeholderTextColor={theme.colors.muted}
              textAlignVertical="top"
            />
          </View>

          <Pressable style={[styles.submitButton, !canContinue && styles.buttonDisabled]} disabled={!canContinue} onPress={continueToReview}>
            <Text style={styles.submitButtonText}>Continue to review</Text>
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
    padding: 20,
    paddingBottom: 36,
  },
  heading: {
    marginBottom: 18,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5f4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.success,
    marginRight: 8,
  },
  statusDotRecording: {
    backgroundColor: '#c4513a',
  },
  statusText: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 3,
  },
  formGrid: {
    gap: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  notesGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notesInput: {
    minHeight: 86,
  },
  recorderBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fbfcfb',
    padding: 16,
    marginBottom: 14,
  },
  speechStatus: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 20,
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#047d76',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#c4513a',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  iconButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  transcriptBox: {
    marginBottom: 16,
  },
  transcriptInput: {
    minHeight: 96,
  },
  submitButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#047d76',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
