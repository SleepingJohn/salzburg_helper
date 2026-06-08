import { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import AnimatedWaveform from '../components/AnimatedWaveform';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Record'>;

type SpeechRecognitionEvent = {
  results: {
    length: number;
    [index: number]: {
      isFinal?: boolean;
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

export default function RecordScreen({ navigation }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [speechSupported] = useState(() => getSpeechRecognition() !== null);
  const [speechStatus, setSpeechStatus] = useState(
    speechSupported ? 'Ready for browser voice recognition.' : 'Voice recognition is simulated on this device.',
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

  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60);
    const secs = value % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecord = () => {
    const SpeechRecognition = getSpeechRecognition();

    setRecording(true);
    setHasRecording(false);
    setSeconds(0);
    setVoiceMessage('');

    if (!SpeechRecognition) {
      setSpeechStatus('No browser voice recognition available. Type the demo transcript below.');
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
      setSpeechStatus('Voice recognition failed. You can type the transcript below.');
      setRecording(false);
    };
    recognizer.onend = () => {
      setRecording(false);
      setHasRecording(true);
      setSpeechStatus('Voice recognition stopped. Review or edit the transcript below.');
    };

    recognition.current = recognizer;
    recognizer.start();
  };

  const handleStop = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
    recognition.current?.stop();
    recognition.current = null;
    setRecording(false);
    setHasRecording(true);
  };

  const canContinue = hasRecording && voiceMessage.trim().length > 0;

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.label}>Step 1 of 4</Text>
        <Text style={styles.pageTitle}>Record your report</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.instruction}>Speak naturally in your language</Text>
        <AnimatedWaveform active={recording} />
        <Text style={styles.timer}>{formatTime(seconds)}</Text>

        <View style={styles.controlRow}>
          <Pressable style={[styles.controlButton, recording && styles.controlButtonActive]} onPress={handleRecord}>
            <Text style={styles.controlText}>Record</Text>
          </Pressable>
          <Pressable style={[styles.controlButton, !recording && styles.controlButtonDisabled]} onPress={handleStop}>
            <Text style={styles.controlText}>Stop</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.demoCard}>
        <Text style={styles.demoLabel}>{speechSupported ? 'Recognized voice message' : 'Demo voice message'}</Text>
        <Text style={styles.speechStatus}>{speechStatus}</Text>
        <TextInput
          style={styles.demoInput}
          value={voiceMessage}
          onChangeText={setVoiceMessage}
          multiline
          placeholder="Say or type the message here"
          placeholderTextColor={theme.colors.muted}
        />
      </View>

      <Pressable
        style={[styles.continueButton, !canContinue && styles.continueDisabled]}
        disabled={!canContinue}
        onPress={() =>
          navigation.navigate('Processing', {
            nativeLanguage: 'English',
            mockTranscript: voiceMessage,
            voiceUri: 'mock-recording://salzburg-graffiti-report',
          })
        }
      >
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  label: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    lineHeight: 36,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
    marginBottom: 24,
  },
  instruction: {
    color: theme.colors.muted,
    fontSize: 16,
    marginBottom: 20,
  },
  timer: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: 18,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  controlButton: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    marginHorizontal: 6,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  controlButtonDisabled: {
    opacity: 0.55,
  },
  controlText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  demoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  demoLabel: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  demoInput: {
    minHeight: 72,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  speechStatus: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  continueDisabled: {
    opacity: 0.5,
  },
  continueText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
  },
});
