import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CitizenReport,
  getCurrentReport,
  getReportById,
  getTrackingSteps,
  listReports,
  statusLabels,
  subscribeReports,
} from '../data/reports';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Tracking'>;

const citizenGreen = '#2E7F18';
const brandRed = '#A20B0B';

export default function TrackingScreen({ route, navigation }: Props) {
  const reportId = route.params?.reportId;
  const getVisibleReport = () => (reportId ? getReportById(reportId) ?? getCurrentReport() : getCurrentReport());
  const [report, setReport] = useState<CitizenReport>(getVisibleReport());
  const [openReports, setOpenReports] = useState(() =>
    listReports().filter(item => item.status !== 'resolved' && item.status !== 'rejected'),
  );
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    setReport(getVisibleReport());
    return subscribeReports(() => {
      setReport(getVisibleReport());
      setOpenReports(listReports().filter(item => item.status !== 'resolved' && item.status !== 'rejected'));
    });
  }, [reportId]);

  const statuses = getTrackingSteps(report);

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

        <View style={styles.headerBlock}>
          <Text style={styles.title}>View Status</Text>
          <Text style={styles.subtitle}>Track how your report moves through Stadt Salzburg.</Text>
        </View>

        {openReports.length > 1 ? (
          <View style={styles.issueSelector}>
            <Pressable
              style={styles.selectorButton}
              onPress={() => setSelectorOpen(current => !current)}
              accessibilityLabel="Select open issue"
            >
              <View style={styles.selectorTextBlock}>
                <Text style={styles.selectorLabel}>Open issue</Text>
                <Text style={styles.selectorTitle}>{report.title}</Text>
                <Text style={styles.selectorMeta}>
                  {report.id} | {statusLabels[report.status]}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={selectorOpen ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={citizenGreen}
              />
            </Pressable>

            {selectorOpen ? (
              <View style={styles.selectorMenu}>
                {openReports.map(openReport => {
                  const active = openReport.id === report.id;

                  return (
                    <Pressable
                      key={openReport.id}
                      style={[styles.selectorOption, active && styles.selectorOptionActive]}
                      onPress={() => {
                        setReport(openReport);
                        setSelectorOpen(false);
                      }}
                    >
                      <View style={styles.selectorTextBlock}>
                        <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{openReport.title}</Text>
                        <Text style={[styles.optionMeta, active && styles.optionMetaActive]}>
                          {openReport.id} | {statusLabels[openReport.status]}
                        </Text>
                      </View>
                      {active ? <MaterialCommunityIcons name="check" size={18} color="#fff" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.referenceCard}>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Reference ID</Text>
            <Text style={styles.referenceValue}>{report.id}</Text>
          </View>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Location</Text>
            <Text style={styles.referenceValue}>{report.location}</Text>
          </View>
          <View style={styles.referenceRow}>
            <Text style={styles.referenceLabel}>Submitted</Text>
            <Text style={styles.referenceValue}>{report.createdAt}</Text>
          </View>
        </View>

        <View style={styles.reportCard}>
          <Text style={styles.sectionTitle}>Report details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Title</Text>
            <Text style={styles.detailValue}>{report.title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issue</Text>
            <Text style={styles.detailValue}>{report.issue}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department</Text>
            <Text style={styles.detailValue}>{report.department}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expected</Text>
            <Text style={styles.detailValue}>1-2 working days</Text>
          </View>
        </View>

        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Issue progress</Text>
          <View style={styles.statusList}>
            {statuses.map((status, index) => (
              <View key={status.label} style={styles.statusRow}>
                <View style={[styles.statusDot, status.completed && styles.statusDotDone]}>
                  {status.completed ? (
                    <MaterialCommunityIcons name="check" size={18} color="#fff" />
                  ) : (
                    <Text style={styles.statusNumber}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.statusCopy}>
                  <Text style={styles.statusLabel}>{status.label}</Text>
                  <Text style={styles.statusMeta}>{status.completed ? 'Completed' : 'Pending'}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.updatesCard}>
          <Text style={styles.sectionTitle}>Updates from the city</Text>
          <View style={styles.updateList}>
            {report.publicUpdates.length ? (
              report.publicUpdates.map(update => (
                <View key={update.id} style={styles.updateItem}>
                  <View style={styles.updateIcon}>
                    <MaterialCommunityIcons name="message-text-outline" size={16} color={citizenGreen} />
                  </View>
                  <View style={styles.updateCopy}>
                    <Text style={styles.updateDate}>{update.createdAt}</Text>
                    <Text style={styles.updateText}>{update.message}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyUpdateText}>No city updates yet.</Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
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
  headerBlock: {
    marginBottom: 22,
  },
  title: {
    color: '#000',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#8c8c8c',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
  },
  referenceCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 20,
  },
  issueSelector: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 20,
  },
  selectorButton: {
    minHeight: 62,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectorTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  selectorLabel: {
    color: '#8c8c8c',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  selectorTitle: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  selectorMeta: {
    color: '#8c8c8c',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  selectorMenu: {
    gap: 7,
    marginTop: 8,
  },
  selectorOption: {
    minHeight: 56,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ececec',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorOptionActive: {
    backgroundColor: citizenGreen,
    borderColor: citizenGreen,
  },
  optionTitle: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 19,
  },
  optionTitleActive: {
    color: '#fff',
  },
  optionMeta: {
    color: '#8c8c8c',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  optionMetaActive: {
    color: '#edf8eb',
  },
  referenceRow: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  referenceLabel: {
    width: 96,
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  referenceValue: {
    flex: 1,
    color: '#8c8c8c',
    fontSize: 15,
    fontWeight: '500',
  },
  timelineCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
  },
  reportCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    paddingVertical: 7,
  },
  detailLabel: {
    width: 86,
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    flex: 1,
    color: '#8c8c8c',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  statusList: {
    gap: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: '#fff',
  },
  statusDotDone: {
    backgroundColor: citizenGreen,
    borderColor: citizenGreen,
  },
  statusNumber: {
    color: '#000',
    fontWeight: '700',
  },
  statusCopy: {
    flex: 1,
  },
  statusLabel: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  statusMeta: {
    color: '#8c8c8c',
    fontSize: 12,
    marginTop: 3,
  },
  updatesCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    padding: 18,
  },
  updateList: {
    gap: 14,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateCopy: {
    flex: 1,
  },
  updateDate: {
    color: '#8c8c8c',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
  },
  updateText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  emptyUpdateText: {
    color: '#8c8c8c',
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    marginTop: 28,
    gap: 11,
  },
  primaryButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: brandRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fdfbfb',
    fontSize: 15,
    fontWeight: '600',
  },
});
