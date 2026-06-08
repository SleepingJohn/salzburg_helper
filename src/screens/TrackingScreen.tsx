import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
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

  const completedCount = statuses.filter(status => status.completed).length;
  const currentStatus = useMemo(() => statuses[completedCount - 1] ?? statuses[0], [completedCount, statuses]);
  const progressPercent = statuses.length ? Math.round((completedCount / statuses.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>SS</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.eyebrow}>Report SAL-2048</Text>
            <Text style={styles.pageTitle}>Progress Dashboard</Text>
            <Text style={styles.subtitle}>Track how your report moves through Stadt Salzburg.</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Status</Text>
            <Text style={styles.metricValue}>{currentStatus?.label ?? 'Loading'}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Progress</Text>
            <Text style={styles.metricValue}>{progressPercent}%</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Department</Text>
            <Text style={styles.metricValue}>Cleaning</Text>
          </View>
        </View>

        <View style={styles.pipelinePanel}>
          <View style={styles.panelHeading}>
            <View>
              <Text style={styles.eyebrow}>Live pipeline</Text>
              <Text style={styles.panelTitle}>Issue status</Text>
            </View>
            <View style={styles.livePill}>
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pipeline}>
            {statuses.map((status, index) => (
              <View key={status.label} style={[styles.pipelineItem, status.completed && styles.pipelineItemDone]}>
                <View style={[styles.pipelineNumber, status.completed && styles.pipelineNumberDone]}>
                  <Text style={styles.pipelineNumberText}>{status.completed ? '✓' : index + 1}</Text>
                </View>
                <Text style={[styles.pipelineText, status.completed && styles.pipelineTextDone]}>{status.label}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Issue</Text>
              <Text style={styles.detailValue}>Graffiti</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>Auto-detected</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Next action</Text>
              <Text style={styles.detailValue}>City route review</Text>
            </View>
          </View>
        </View>

        <StatusTimeline statuses={statuses} />

        <View style={styles.actions}>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('AuthorityDashboard')}>
            <Text style={styles.secondaryButtonText}>Open authority view</Text>
          </Pressable>
          <Pressable style={styles.finishButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.finishText}>Finish</Text>
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
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: theme.colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandMarkText: {
    color: '#fff',
    fontWeight: '900',
  },
  titleBlock: {
    flex: 1,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.colors.text,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.muted,
    lineHeight: 22,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    minHeight: 84,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#f0f5f4',
    padding: 12,
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  pipelinePanel: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    padding: 18,
    marginBottom: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 3,
  },
  panelHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  livePill: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#f0f5f4',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  liveText: {
    color: theme.colors.success,
    fontWeight: '900',
  },
  pipeline: {
    gap: 8,
    paddingBottom: 2,
  },
  pipelineItem: {
    width: 116,
    minHeight: 86,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fbfcfb',
    padding: 10,
  },
  pipelineItemDone: {
    borderColor: 'rgba(4, 125, 118, 0.32)',
    backgroundColor: 'rgba(4, 125, 118, 0.06)',
  },
  pipelineNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9aa4ad',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pipelineNumberDone: {
    backgroundColor: '#047d76',
  },
  pipelineNumberText: {
    color: '#fff',
    fontWeight: '900',
  },
  pipelineText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 17,
  },
  pipelineTextDone: {
    color: theme.colors.text,
  },
  detailGrid: {
    gap: 10,
    marginTop: 16,
  },
  detailItem: {
    minHeight: 58,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#f8fafc',
    padding: 12,
  },
  detailLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  detailValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: '900',
  },
  finishButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#047d76',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
});
