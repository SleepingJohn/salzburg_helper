import { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Image, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

type SpeechRecognitionErrorEvent = {
  error?: string;
};

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
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

export default function RecordScreen({ route, navigation }: Props) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [photoStatus, setPhotoStatus] = useState('Optional: add a photo of the issue.');
  const [fileName, setFileName] = useState('');
  const [fileUri, setFileUri] = useState('');
  const [fileStatus, setFileStatus] = useState('Optional: attach a related file from storage.');
  const [speechSupported] = useState(() => getSpeechRecognition() !== null);
  const [speechStatus, setSpeechStatus] = useState(
    speechSupported
      ? 'Ready for voice recognition. Use Chrome or Edge and allow microphone access.'
      : 'Real speech-to-text is available in Expo Web only. Type the transcript below on Expo Go.',
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

    setHasRecording(false);
    setSeconds(0);

    if (!SpeechRecognition) {
      setRecording(false);
      setHasRecording(true);
      setSpeechStatus('Speech-to-text is not available here. Run Expo Web in Chrome/Edge, or type the transcript below.');
      return;
    }

    setRecording(true);
    setVoiceMessage('');
    setSpeechStatus('Starting voice recognition...');

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
    recognizer.onerror = event => {
      const reason = event.error ? ` (${event.error})` : '';
      setSpeechStatus(`Voice recognition failed${reason}. Check microphone permission or type the transcript below.`);
      setRecording(false);
      setHasRecording(true);
    };
    recognizer.onend = () => {
      setRecording(false);
      setHasRecording(true);
      setSpeechStatus('Recording stopped. Review or edit the transcript.');
    };

    recognition.current = recognizer;
    try {
      recognizer.start();
    } catch {
      setRecording(false);
      setHasRecording(true);
      setSpeechStatus('Voice recognition could not start. Refresh the browser or type the transcript below.');
    }
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
    setSpeechStatus(
      speechSupported
        ? 'Ready for voice recognition. Use Chrome or Edge and allow microphone access.'
        : 'Real speech-to-text is available in Expo Web only. Type the transcript below on Expo Go.',
    );
  };

  const canContinue = voiceMessage.trim().length > 0;
  const recordingState = recording ? 'Recording' : hasRecording ? 'Recorded' : 'No recording';

  const continueToReview = () => {
    const citizenName = [route.params.firstName.trim(), route.params.lastName.trim()].filter(Boolean).join(' ');
    const context = [
      voiceMessage.trim(),
      route.params.address.trim() ? `Address: ${route.params.address.trim()}` : '',
      route.params.email.trim() ? `Email: ${route.params.email.trim()}` : '',
      citizenName ? `Citizen: ${citizenName}` : '',
      photoUri ? 'Photo attached: yes' : '',
      fileUri ? `File attached: ${fileName || 'yes'}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigation.navigate('Processing', {
      nativeLanguage: 'English',
      mockTranscript: context,
    });
  };

  const addPhoto = async () => {
    setPhotoStatus('Opening photo library...');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setPhotoStatus('Photo permission was not granted.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      setPhotoStatus('No photo selected.');
      return;
    }

    setPhotoUri(result.assets[0].uri);
    setPhotoStatus('Photo attached to this report.');
  };

  const takePhoto = async () => {
    setPhotoStatus('Opening camera...');
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      setPhotoStatus('Camera permission was not granted.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      setPhotoStatus('No photo taken.');
      return;
    }

    setPhotoUri(result.assets[0].uri);
    setPhotoStatus('Photo attached to this report.');
  };

  const removePhoto = () => {
    setPhotoUri('');
    setPhotoStatus('Optional: add a photo of the issue.');
  };

  const addFile = async () => {
    setFileStatus('Opening file picker...');
    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets[0]) {
      setFileStatus('No file selected.');
      return;
    }

    setFileUri(result.assets[0].uri);
    setFileName(result.assets[0].name);
    setFileStatus('File attached to this report.');
  };

  const removeFile = () => {
    setFileUri('');
    setFileName('');
    setFileStatus('Optional: attach a related file from storage.');
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View>
            <Text style={styles.eyebrow}>Active QR: Salzburg city service point</Text>
            <Text style={styles.title}>Voice memo or written report</Text>
            <Text style={styles.contextText}>
              {route.params.address || 'No address provided yet'}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, recording && styles.statusDotRecording]} />
            <Text style={styles.statusText}>
              {recordingState} | {formatTime(seconds)}
            </Text>
          </View>
        </View>

        <View style={styles.panel}>
          <View style={styles.recorderBox}>
            <Text style={styles.speechStatus}>{speechStatus}</Text>
            <AnimatedWaveform active={recording} />
            <View style={styles.controls}>
              <Pressable
                style={[styles.primaryButton, recording && styles.buttonDisabled]}
                disabled={recording}
                onPress={startRecording}
              >
                <MaterialCommunityIcons name="microphone" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Start</Text>
              </Pressable>
              <Pressable
                style={[styles.dangerButton, !recording && styles.buttonDisabled]}
                disabled={!recording}
                onPress={stopRecording}
              >
                <MaterialCommunityIcons name="stop" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Stop</Text>
              </Pressable>
              <Pressable
                style={[styles.iconButton, (!hasRecording || recording) && styles.buttonDisabled]}
                disabled={!hasRecording || recording}
                onPress={discardRecording}
              >
                <MaterialCommunityIcons name="restart" size={21} color={theme.colors.text} />
              </Pressable>
            </View>
          </View>

          <View style={styles.transcriptBox}>
            <Text style={styles.inputLabel}>{speechSupported ? 'Recognized voice message or written report' : 'Written report'}</Text>
            <TextInput
              style={[styles.input, styles.transcriptInput]}
              value={voiceMessage}
              onChangeText={setVoiceMessage}
              multiline
              placeholder="Speak, or write the report text here"
              placeholderTextColor={theme.colors.muted}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.evidenceBox}>
            <View style={styles.evidenceHeader}>
              <View style={styles.attachmentCopy}>
                <Text style={styles.sectionTitle}>Evidence</Text>
                <Text style={styles.photoStatus}>Add a photo or file to help the city understand the issue.</Text>
              </View>
            </View>

            <View style={styles.photoPreviewCard}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                  <View style={styles.attachmentFooter}>
                    <View>
                      <Text style={styles.attachmentTitle}>Issue photo attached</Text>
                      <Text style={styles.photoStatus}>{photoStatus}</Text>
                    </View>
                    <Pressable style={styles.removePhotoButton} onPress={removePhoto}>
                      <Text style={styles.removePhotoText}>Remove</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <View style={styles.emptyIconCircle}>
                    <MaterialCommunityIcons name="image-plus" size={28} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.photoPlaceholderText}>No photo added yet</Text>
                  <Text style={styles.photoPlaceholderHint}>Take a picture or choose one from storage.</Text>
                </View>
              )}
            </View>

            <View style={styles.actionGrid}>
              <Pressable style={styles.actionTile} onPress={takePhoto}>
                <MaterialCommunityIcons name="camera-outline" size={23} color={theme.colors.primary} />
                <Text style={styles.actionTitle}>{photoUri ? 'Retake' : 'Camera'}</Text>
              </Pressable>
              <Pressable style={styles.actionTile} onPress={addPhoto}>
                <MaterialCommunityIcons name="image-multiple-outline" size={23} color={theme.colors.primary} />
                <Text style={styles.actionTitle}>Photos</Text>
              </Pressable>
              <Pressable style={styles.actionTile} onPress={addFile}>
                <MaterialCommunityIcons name="file-upload-outline" size={23} color={theme.colors.primary} />
                <Text style={styles.actionTitle}>Files</Text>
              </Pressable>
            </View>

            {fileUri ? (
              <View style={styles.fileCard}>
                <View style={styles.fileIconCircle}>
                  <MaterialCommunityIcons name="file-document-outline" size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.fileTextBlock}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {fileName}
                  </Text>
                  <Text style={styles.fileMeta}>{fileStatus}</Text>
                </View>
                <Pressable style={styles.removeInlineButton} onPress={removeFile}>
                  <Text style={styles.removePhotoText}>Remove</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.attachmentHint}>{fileStatus}</Text>
            )}
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
  contextText: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
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
    marginLeft: 7,
  },
  transcriptBox: {
    marginBottom: 16,
  },
  transcriptInput: {
    minHeight: 96,
  },
  evidenceBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fbfcfb',
    padding: 16,
    marginBottom: 16,
  },
  evidenceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  attachmentCopy: {
    flex: 1,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  photoStatus: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  removePhotoButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  removePhotoText: {
    color: theme.colors.danger,
    fontWeight: '900',
    fontSize: 13,
  },
  photoPreviewCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photoPlaceholder: {
    minHeight: 152,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(4, 125, 118, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoPlaceholderText: {
    color: theme.colors.primary,
    fontWeight: '900',
    marginBottom: 4,
  },
  photoPlaceholderHint: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  attachmentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
  },
  attachmentTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  fileCard: {
    minHeight: 68,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 12,
  },
  fileIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(4, 125, 118, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileTextBlock: {
    flex: 1,
  },
  fileName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  fileMeta: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  photoPreview: {
    width: '100%',
    height: 180,
    backgroundColor: theme.colors.border,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionTile: {
    flex: 1,
    minHeight: 74,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    marginTop: 6,
  },
  removeInlineButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginLeft: 10,
  },
  attachmentHint: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
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
