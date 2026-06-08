import { useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthorityDashboard'>;

type AuthorityStatus = 'in_review' | 'needs_information' | 'in_progress' | 'resolved' | 'rejected';

type AuthorityCase = {
  id: string;
  category: string;
  priority: string;
  title: string;
  status: AuthorityStatus;
  routeReason: string;
  confidence: string;
  text: string;
  comment: string;
};

const statusOptions: AuthorityStatus[] = ['in_review', 'needs_information', 'in_progress', 'resolved', 'rejected'];

const initialCases: AuthorityCase[] = [
  {
    id: 'SAL-2048',
    category: 'Graffiti',
    priority: 'medium',
    title: 'Graffiti near Kapitelberg 5',
    status: 'in_review',
    routeReason: 'Matched to Public Cleaning Services',
    confidence: '94%',
    text: 'Graffiti on the building near Kapitelberg 5. The citizen requested cleanup support.',
    comment: 'Forwarded to cleaning route team.',
  },
  {
    id: 'SAL-2047',
    category: 'Street lighting',
    priority: 'high',
    title: 'Broken light at pedestrian crossing',
    status: 'in_progress',
    routeReason: 'Matched to Infrastructure Maintenance',
    confidence: '88%',
    text: 'Street light is not working near the crossing. The area feels unsafe at night.',
    comment: 'Technician assigned.',
  },
  {
    id: 'SAL-2046',
    category: 'General message',
    priority: 'low',
    title: 'Citizen greeting from QR test',
    status: 'needs_information',
    routeReason: 'No actionable issue detected',
    confidence: '61%',
    text: 'Hello.',
    comment: 'Ask citizen for more details.',
  },
];

const statusLabels: Record<AuthorityStatus, string> = {
  in_review: 'In review',
  needs_information: 'Needs info',
  in_progress: 'In progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
};

function getStatusTone(status: AuthorityStatus) {
  if (status === 'resolved') {
    return styles.statusComplete;
  }
  if (status === 'needs_information' || status === 'rejected') {
    return styles.statusWarning;
  }
  return styles.statusActive;
}

export default function AuthorityDashboardScreen({ navigation }: Props) {
  const [cases, setCases] = useState(initialCases);
  const [selectedId, setSelectedId] = useState(initialCases[0].id);
  const [message, setMessage] = useState('');

  const report = useMemo(() => {
    const openCount = cases.filter(item => item.status !== 'resolved' && item.status !== 'rejected').length;
    const categories = new Set(cases.map(item => item.category));
    const byStatus = cases.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});

    return {
      total: cases.length,
      openCount,
      categoryCount: categories.size,
      byStatus,
    };
  }, [cases]);

  const updateCase = (id: string, patch: Partial<AuthorityCase>) => {
    setCases(current => current.map(item => (item.id === id ? { ...item, ...patch } : item)));
    setSelectedId(id);
    setMessage('');
  };

  const saveStatus = (id: string) => {
    setSelectedId(id);
    setMessage(`Saved update for ${id}`);
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topbar}>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>SS</Text>
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.title}>Authority Dashboard</Text>
              <Text style={styles.subtitle}>Assigned citizen reports for Stadt Salzburg</Text>
            </View>
          </View>
          <Pressable style={styles.iconButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.iconButtonText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.summaryPanel}>
          <View style={styles.panelHeading}>
            <View>
              <Text style={styles.eyebrow}>Public Cleaning Services</Text>
              <Text style={styles.panelTitle}>Assigned complaints</Text>
            </View>
            <View style={styles.livePill}>
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Total</Text>
              <Text style={styles.metricValue}>{report.total}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Open</Text>
              <Text style={styles.metricValue}>{report.openCount}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Categories</Text>
              <Text style={styles.metricValue}>{report.categoryCount}</Text>
            </View>
          </View>

          <View style={styles.statusBars}>
            {Object.entries(report.byStatus).map(([status, count]) => (
              <View key={status} style={styles.statusBar}>
                <Text style={styles.statusBarLabel}>{statusLabels[status as AuthorityStatus]}</Text>
                <Text style={styles.statusBarCount}>{count}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.formMessage}>{message || 'Ready for status updates.'}</Text>
        </View>

        <View style={styles.caseList}>
          {cases.map(item => (
            <View key={item.id} style={[styles.caseCard, selectedId === item.id && styles.caseCardSelected]}>
              <View style={styles.caseHeading}>
                <View style={styles.caseTitleBlock}>
                  <Text style={styles.eyebrow}>
                    {item.category} | {item.priority}
                  </Text>
                  <Text style={styles.caseTitle}>{item.title}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusTone(item.status)]}>
                  <Text style={styles.statusBadgeText}>{statusLabels[item.status]}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Clipboard: {item.routeReason}</Text>
                <Text style={styles.metaText}>Confidence: {item.confidence}</Text>
              </View>

              <Text style={styles.caseText}>{item.text}</Text>

              <View style={styles.statusOptions}>
                {statusOptions.map(status => (
                  <Pressable
                    key={status}
                    style={[styles.statusOption, item.status === status && styles.statusOptionActive]}
                    onPress={() => updateCase(item.id, { status })}
                  >
                    <Text style={[styles.statusOptionText, item.status === status && styles.statusOptionTextActive]}>
                      {statusLabels[status]}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.inputLabel}>Authority comment</Text>
              <TextInput
                style={styles.commentInput}
                value={item.comment}
                onChangeText={comment => updateCase(item.id, { comment })}
                placeholder="Add a short internal note"
                placeholderTextColor={theme.colors.muted}
              />

              <Pressable style={styles.saveButton} onPress={() => saveStatus(item.id)}>
                <Text style={styles.saveButtonText}>Save update</Text>
              </Pressable>
            </View>
          ))}
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
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brandBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
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
  brandCopy: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  iconButtonText: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  summaryPanel: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    padding: 18,
    marginBottom: 18,
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
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'uppercase',
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  metric: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#f0f5f4',
    padding: 12,
  },
  metricLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 3,
  },
  statusBars: {
    gap: 8,
  },
  statusBar: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  statusBarLabel: {
    color: theme.colors.text,
    fontWeight: '800',
  },
  statusBarCount: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  formMessage: {
    minHeight: 22,
    color: theme.colors.muted,
    fontWeight: '700',
    marginTop: 12,
  },
  caseList: {
    gap: 14,
  },
  caseCard: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    padding: 16,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  caseCardSelected: {
    borderColor: '#047d76',
  },
  caseHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  caseTitleBlock: {
    flex: 1,
  },
  caseTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  statusBadge: {
    minHeight: 30,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActive: {
    backgroundColor: 'rgba(4, 125, 118, 0.09)',
    borderColor: 'rgba(4, 125, 118, 0.22)',
  },
  statusWarning: {
    backgroundColor: 'rgba(177, 132, 22, 0.12)',
    borderColor: 'rgba(177, 132, 22, 0.28)',
  },
  statusComplete: {
    backgroundColor: 'rgba(36, 122, 77, 0.1)',
    borderColor: 'rgba(36, 122, 77, 0.24)',
  },
  statusBadgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  metaRow: {
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  caseText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statusOption: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  statusOptionActive: {
    backgroundColor: '#075c58',
    borderColor: '#075c58',
  },
  statusOptionText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  statusOptionTextActive: {
    color: '#fff',
  },
  inputLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  commentInput: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  saveButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: '#047d76',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
});
