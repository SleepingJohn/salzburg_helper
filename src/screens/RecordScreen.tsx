import { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Record'>;

const citizenGreen = '#2E7F18';
const brandRed = '#A20B0B';

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
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

const getSpeechRecognitionLanguage = () => {
  if (typeof navigator === 'undefined') {
    return 'de-AT';
  }

  return navigator.language || 'de-AT';
};

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60);
  const secs = value % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export default function RecordScreen({ route, navigation }: Props) {
  const [fullName, setFullName] = useState([route.params.firstName, route.params.lastName].filter(Boolean).join(' '));
  const [email, setEmail] = useState(route.params.email);
  const [address, setAddress] = useState(route.params.address);
  const [issueTitle, setIssueTitle] = useState('');
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
      ? 'Ready for live transcription. Allow microphone access when prompted.'
      : 'Speech-to-text is available on Expo Web in Chrome or Edge. On Expo Go, type the transcript below.',
  );
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognition = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscript = useRef('');
  const latestTranscript = useRef('');

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
      setSpeechStatus('Live transcription is not available in this runtime. Type the message below, or run Expo Web in Chrome/Edge.');
      return;
    }

    setRecording(true);
    finalTranscript.current = voiceMessage.trim();
    latestTranscript.current = voiceMessage.trim();
    setSpeechStatus('Starting voice recognition...');

    const recognizer = new SpeechRecognition();
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.lang = getSpeechRecognitionLanguage();
    recognizer.onresult = event => {
      let interimTranscript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0].transcript;

        if (event.results[index].isFinal) {
          finalTranscript.current = `${finalTranscript.current} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }

      const nextTranscript = `${finalTranscript.current} ${interimTranscript}`.trim();
      latestTranscript.current = nextTranscript;
      setVoiceMessage(nextTranscript);
      setSpeechStatus(interimTranscript ? 'Listening and transcribing...' : 'Listening...');
    };
    recognizer.onerror = event => {
      const reason = event.error ? ` (${event.error})` : '';
      setSpeechStatus(`Voice recognition failed${reason}. Check microphone permission or type the transcript below.`);
      setRecording(false);
      setHasRecording(Boolean(latestTranscript.current.trim()));
      recognition.current = null;
    };
    recognizer.onend = () => {
      setRecording(false);
      setHasRecording(Boolean(finalTranscript.current.trim() || latestTranscript.current.trim()));
      setSpeechStatus(
        finalTranscript.current.trim() || latestTranscript.current.trim()
          ? 'Recording stopped. Review or edit the transcript.'
          : 'Recording stopped without transcript. Try again or type the message below.',
      );
      recognition.current = null;
    };

    recognition.current = recognizer;
    try {
      recognizer.start();
    } catch {
      setRecording(false);
      setHasRecording(Boolean(latestTranscript.current.trim()));
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
    setHasRecording(Boolean(latestTranscript.current.trim()));
    setSpeechStatus(
      latestTranscript.current.trim()
        ? 'Recording stopped. Review or edit the transcript.'
        : 'Recording stopped without transcript. Try again or type the message below.',
    );
  };

  const toggleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
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

  const canContinue = issueTitle.trim().length > 0 && voiceMessage.trim().length > 0;

  const continueToReview = () => {
    const context = [
      voiceMessage.trim(),
      address.trim() ? `Address: ${address.trim()}` : '',
      email.trim() ? `Email: ${email.trim()}` : '',
      fullName.trim() ? `Citizen: ${fullName.trim()}` : '',
      photoUri ? 'Photo attached: yes' : '',
      fileUri ? `File attached: ${fileName || 'yes'}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    navigation.navigate('Processing', {
      nativeLanguage: 'English',
      mockTranscript: context,
      citizenMessage: voiceMessage.trim(),
      issueTitle: issueTitle.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      address: address.trim(),
      hasPhoto: Boolean(photoUri),
      fileName: fileName.trim(),
    });
  };

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

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Jane Smith"
              placeholderTextColor="#8c8c8c"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="jane@example.com"
              placeholderTextColor="#8c8c8c"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.locationField}>
              <TextInput
                style={styles.locationInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Location"
                placeholderTextColor="#8c8c8c"
              />
              <Pressable style={styles.blackIconButton} accessibilityLabel="Location">
                <MaterialCommunityIcons name="crosshairs-gps" size={15} color="#f6f5f5" />
              </Pressable>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Issue title</Text>
              <Text style={styles.counterText}>{issueTitle.length}/50</Text>
            </View>
            <TextInput
              style={styles.input}
              value={issueTitle}
              onChangeText={setIssueTitle}
              placeholder="Short title for the issue"
              placeholderTextColor="#8c8c8c"
              maxLength={50}
              returnKeyType="next"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.inputLabel}>Tell us about your issue</Text>
            <View style={styles.issueField}>
              <TextInput
                style={styles.issueInput}
                value={voiceMessage}
                onChangeText={text => {
                  latestTranscript.current = text;
                  setVoiceMessage(text);
                }}
                multiline
                placeholder="Describe the issue...."
                placeholderTextColor="#8c8c8c"
                textAlignVertical="top"
              />
              <View style={styles.issueActions}>
                <Pressable
                  style={[styles.blackIconButton, recording && styles.recordingButton]}
                  onPress={toggleRecording}
                  accessibilityLabel={recording ? 'Stop voice memo' : 'Record voice memo'}
                >
                  <MaterialCommunityIcons name={recording ? 'stop' : 'microphone'} size={15} color="#f6f5f5" />
                </Pressable>
                <Pressable style={styles.blackIconButton} onPress={takePhoto} accessibilityLabel="Take photo">
                  <MaterialCommunityIcons name="camera-outline" size={15} color="#f6f5f5" />
                </Pressable>
                <Pressable style={styles.blackIconButton} onPress={addPhoto} accessibilityLabel="Choose photo">
                  <MaterialCommunityIcons name="image-outline" size={15} color="#f6f5f5" />
                </Pressable>
                <Pressable style={styles.blackIconButton} onPress={addFile} accessibilityLabel="Attach file">
                  <MaterialCommunityIcons name="paperclip" size={15} color="#f6f5f5" />
                </Pressable>
              </View>
            </View>
          </View>

          {recording || hasRecording || photoUri || fileUri ? (
            <View style={styles.supportBlock}>
              {recording || hasRecording ? (
                <Text style={styles.statusText}>
                  {recording ? `Recording ${formatTime(seconds)}` : 'Voice memo ready.'}
                </Text>
              ) : null}
              {photoUri ? (
                <Pressable onPress={removePhoto}>
                  <Text style={[styles.attachmentText, styles.attachmentTextActive]}>Photo attached. Tap to remove.</Text>
                </Pressable>
              ) : null}
              {fileUri ? (
                <Pressable onPress={removeFile}>
                  <Text style={[styles.attachmentText, styles.attachmentTextActive]}>
                    {fileName || 'File attached'}. Tap to remove.
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Pressable
            style={[styles.submitButton, !canContinue && styles.buttonDisabled]}
            disabled={!canContinue}
            onPress={continueToReview}
          >
            <Text style={styles.submitButtonText}>Report Issue</Text>
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
  form: {
    gap: 13,
  },
  fieldGroup: {
    gap: 9,
  },
  inputLabel: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterText: {
    color: '#8c8c8c',
    fontSize: 12,
    fontWeight: '500',
  },
  input: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    color: '#111',
    fontSize: 15,
    paddingHorizontal: 24,
  },
  locationField: {
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 6,
  },
  locationInput: {
    flex: 1,
    color: '#111',
    fontSize: 15,
  },
  blackIconButton: {
    width: 26,
    height: 26,
    borderRadius: 15,
    backgroundColor: '#0e0b0b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    backgroundColor: brandRed,
  },
  issueField: {
    minHeight: 99,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 40,
    position: 'relative',
  },
  issueInput: {
    minHeight: 48,
    color: '#111',
    fontSize: 15,
    lineHeight: 21,
    padding: 0,
  },
  issueActions: {
    position: 'absolute',
    right: 14,
    bottom: 8,
    flexDirection: 'row',
    gap: 6,
  },
  supportBlock: {
    marginTop: 19,
    marginBottom: 12,
  },
  supportText: {
    color: '#8c8c8c',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '300',
  },
  statusText: {
    color: '#8c8c8c',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  attachmentText: {
    color: '#8c8c8c',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  attachmentTextActive: {
    color: citizenGreen,
    fontWeight: '700',
  },
  submitButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: brandRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fdfbfb',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});
