import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import StatusTimeline from '../components/StatusTimeline';
import { fetchTrackingStatus, TrackingStatus } from '../api/mockAI';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Tracking'>;

export default function TrackingScreen({ navigation }: Props) {
  const [statuses, setStatuses] = useState<TrackingStatus[]>([]);

  useEffect(() => {
    fetchTrackingStatus().then(setStatuses);
  }, []);

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Issue Tracking</Text>
          <Text style={styles.subtitle}>Follow the status of your report in real time.</Text>
        </View>

        <StatusTimeline statuses={statuses} />

        <Pressable style={styles.finishButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.finishText}>Finish</Text>
        </Pressable>
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
  header: {
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.muted,
    lineHeight: 24,
  },
  finishButton: {
    marginTop: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  finishText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});
