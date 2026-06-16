import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  addReportUpdate,
  CitizenReport,
  listReports,
  ReportStatus,
  statusLabels,
  subscribeReports,
  updateReport,
} from '../data/reports';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthorityDashboard'>;

const adminBlue = '#49657F';
const adminBlueSoft = 'rgba(73, 101, 127, 0.1)';
const citizenGreen = '#2E7F18';
const dangerRed = '#A20B0B';

const filterOptions: Array<ReportStatus | 'all' | 'open'> = ['open', 'all', 'received', 'resolved'];
const departmentOptions = [
  'Citizen Service Center',
  'Public Cleaning Services',
  'Waste Management',
  'Public Lighting',
  'Road Maintenance',
  'Traffic Management',
  'Parks Department',
  'Public Safety',
];

function isOpen(report: CitizenReport) {
  return report.status !== 'resolved' && report.status !== 'rejected';
}

function getStatusTone(status: ReportStatus) {
  if (status === 'resolved') {
    return styles.statusComplete;
  }

  if (status === 'rejected') {
    return styles.statusWarning;
  }

  return styles.statusActive;
}

export default function AuthorityDashboardScreen({ navigation }: Props) {
  const [reports, setReports] = useState<CitizenReport[]>(listReports());
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Array<ReportStatus | 'all' | 'open'>[number]>('open');
  const [expandedId, setExpandedId] = useState('');
  const [message, setMessage] = useState('Ready for updates.');
  const [updateReportId, setUpdateReportId] = useState('');
  const [resolveReportId, setResolveReportId] = useState('');
  const [updateDraft, setUpdateDraft] = useState('');
  const [departmentDropdownId, setDepartmentDropdownId] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<{
    reportId: string;
    attachment: string;
  } | null>(null);

  useEffect(() => {
    return subscribeReports(() => setReports(listReports()));
  }, []);

  const filteredReports = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reports
      .filter(report => {
        if (filter === 'open') {
          return isOpen(report);
        }

        if (filter === 'all') {
          return true;
        }

        return report.status === filter;
      })
      .filter(report => {
        if (!normalizedQuery) {
          return true;
        }

        return [
          report.id,
          report.title,
          report.issue,
          report.location,
          report.department,
          report.citizenName,
          report.citizenEmail,
          report.citizenMessage,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      });
  }, [filter, query, reports]);

  const updateTarget = reports.find(report => report.id === updateReportId);
  const resolveTarget = reports.find(report => report.id === resolveReportId);
  const attachmentReport = reports.find(report => report.id === attachmentPreview?.reportId);

  const changeDepartment = (report: CitizenReport, department: string) => {
    updateReport(report.id, {
      department,
    });
    setDepartmentDropdownId('');
    setMessage(`${report.id} assigned to ${department}.`);
  };

  const updateInternalNote = (report: CitizenReport, internalComment: string) => {
    updateReport(report.id, { internalComment });
    setMessage(`Internal note saved for ${report.id}.`);
  };

  const openUpdateDialog = (report: CitizenReport) => {
    setUpdateReportId(report.id);
    setUpdateDraft('');
  };

  const sendPublicUpdate = () => {
    if (!updateTarget) {
      return;
    }

    const trimmed = updateDraft.trim();

    if (!trimmed) {
      setMessage('Write a citizen update before sending.');
      return;
    }

    addReportUpdate(updateTarget.id, trimmed);
    setMessage(`Citizen update sent for ${updateTarget.id}.`);
    setUpdateDraft('');
    setUpdateReportId('');
  };

  const confirmResolve = () => {
    if (!resolveTarget) {
      return;
    }

    updateReport(resolveTarget.id, { status: 'resolved' });
    setMessage(`${resolveTarget.id} marked as resolved.`);
    setResolveReportId('');
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <View style={styles.brandBlock}>
            <View style={styles.brandMark}>
              <MaterialCommunityIcons name="office-building-cog-outline" size={23} color="#fff" />
            </View>
            <View style={styles.brandCopy}>
              <Text style={styles.title}>Authority Dashboard</Text>
              <Text style={styles.subtitle}>Review reports and update citizens.</Text>
            </View>
          </View>
          <Pressable style={styles.iconButton} onPress={() => navigation.popToTop()} accessibilityLabel="Back to home">
            <MaterialCommunityIcons name="arrow-left" size={21} color={adminBlue} />
          </Pressable>
        </View>

        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons name="magnify" size={19} color={adminBlue} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search reports"
              placeholderTextColor={theme.colors.muted}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {filterOptions.map(option => {
              const active = filter === option;
              const label = option === 'all' ? 'All' : option === 'open' ? 'Open' : statusLabels[option];

              return (
                <Pressable
                  key={option}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilter(option)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.reportList}>
          {filteredReports.map(report => {
            const expanded = expandedId === report.id;

            return (
              <View key={report.id} style={styles.reportCard}>
                <Pressable
                  style={styles.reportHeader}
                  onPress={() => setExpandedId(current => (current === report.id ? '' : report.id))}
                  accessibilityLabel={`${expanded ? 'Collapse' : 'Expand'} ${report.title}`}
                >
                  <View style={styles.reportTitleBlock}>
                    <Text style={styles.reportId}>{report.id}</Text>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportMeta}>
                      {report.issue} | {report.priority} | {report.location}
                    </Text>
                  </View>
                  <View style={styles.reportHeaderRight}>
                    <View style={[styles.statusBadge, getStatusTone(report.status)]}>
                      <Text style={styles.statusBadgeText}>{statusLabels[report.status]}</Text>
                    </View>
                    <MaterialCommunityIcons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color={adminBlue}
                    />
                  </View>
                </Pressable>

                {expanded ? (
                  <View style={styles.expandedContent}>
                    <View style={styles.factGrid}>
                      <View style={styles.factItem}>
                        <Text style={styles.factLabel}>Citizen</Text>
                        <Text style={styles.factValue}>{report.citizenName}</Text>
                      </View>
                      <View style={styles.factItem}>
                        <Text style={styles.factLabel}>Email</Text>
                        <Text style={styles.factValue}>{report.citizenEmail}</Text>
                      </View>
                      <View style={styles.factItem}>
                        <Text style={styles.factLabel}>Created</Text>
                        <Text style={styles.factValue}>{report.createdAt}</Text>
                      </View>
                      <View style={styles.factItem}>
                        <Text style={styles.factLabel}>Attachments</Text>
                        <Text style={styles.factValue}>{report.attachments.length || 'None'}</Text>
                      </View>
                    </View>

                    <Text style={styles.inputLabel}>Attachments</Text>
                    <View style={styles.attachmentList}>
                      {report.attachments.length ? (
                        report.attachments.map((attachment, index) => (
                          <Pressable
                            key={`${attachment}-${index}`}
                            style={styles.attachmentButton}
                            onPress={() => setAttachmentPreview({ reportId: report.id, attachment })}
                          >
                            <View style={styles.attachmentIcon}>
                              <MaterialCommunityIcons
                                name={
                                  attachment.toLowerCase().includes('photo')
                                    ? 'image-outline'
                                    : attachment.toLowerCase().includes('voice')
                                      ? 'microphone-outline'
                                      : 'file-document-outline'
                                }
                                size={18}
                                color={adminBlue}
                              />
                            </View>
                            <Text style={styles.attachmentText}>{attachment}</Text>
                            <MaterialCommunityIcons name="eye-outline" size={17} color={adminBlue} />
                          </Pressable>
                        ))
                      ) : (
                        <Text style={styles.noAttachmentsText}>No attachments added.</Text>
                      )}
                    </View>

                    <View style={styles.assignmentBlock}>
                      <View style={styles.aiSuggestion}>
                        <MaterialCommunityIcons name="robot-outline" size={16} color={adminBlue} />
                        <View style={styles.aiCopy}>
                          <Text style={styles.aiLabel}>AI suggestion</Text>
                          <Text style={styles.aiValue}>
                            {report.department} | {report.confidence}% confidence
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.inputLabel}>Assigned department</Text>
                      <Pressable
                        style={styles.departmentSelect}
                        onPress={() => setDepartmentDropdownId(current => (current === report.id ? '' : report.id))}
                        accessibilityLabel="Select assigned department"
                      >
                        <Text style={styles.departmentSelectText}>{report.department}</Text>
                        <MaterialCommunityIcons
                          name={departmentDropdownId === report.id ? 'chevron-up' : 'chevron-down'}
                          size={20}
                          color={adminBlue}
                        />
                      </Pressable>
                      {departmentDropdownId === report.id ? (
                        <View style={styles.departmentMenu}>
                          {departmentOptions.map(department => {
                            const active = department === report.department;

                            return (
                              <Pressable
                                key={department}
                                style={[styles.departmentOption, active && styles.departmentOptionActive]}
                                onPress={() => changeDepartment(report, department)}
                              >
                                <Text style={[styles.departmentOptionText, active && styles.departmentOptionTextActive]}>
                                  {department}
                                </Text>
                                {active ? <MaterialCommunityIcons name="check" size={16} color="#fff" /> : null}
                              </Pressable>
                            );
                          })}
                        </View>
                      ) : null}
                    </View>

                    <Text style={styles.reportText}>{report.translatedMessage || report.citizenMessage}</Text>

                    <Text style={styles.inputLabel}>Internal note</Text>
                    <TextInput
                      style={styles.noteInput}
                      value={report.internalComment}
                      onChangeText={internalComment => updateInternalNote(report, internalComment)}
                      placeholder="Internal note, not visible to citizen"
                      placeholderTextColor={theme.colors.muted}
                      multiline
                    />

                    <View style={styles.actions}>
                      {report.status !== 'resolved' ? (
                        <Pressable style={styles.primaryAction} onPress={() => setResolveReportId(report.id)}>
                          <MaterialCommunityIcons name="check" size={18} color="#fff" />
                          <Text style={styles.primaryActionText}>Mark resolved</Text>
                        </Pressable>
                      ) : null}
                      <Pressable style={styles.secondaryAction} onPress={() => openUpdateDialog(report)}>
                        <MaterialCommunityIcons name="send-outline" size={18} color={adminBlue} />
                        <Text style={styles.secondaryActionText}>Send update</Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <Text style={styles.formMessage}>{message}</Text>
      </ScrollView>

      <Modal visible={Boolean(resolveTarget)} transparent animationType="fade" onRequestClose={() => setResolveReportId('')}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Mark as resolved?</Text>
            <Text style={styles.modalText}>{resolveTarget?.title}</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondary} onPress={() => setResolveReportId('')}>
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary} onPress={confirmResolve}>
                <Text style={styles.modalPrimaryText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(updateTarget)} transparent animationType="fade" onRequestClose={() => setUpdateReportId('')}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Send update to citizen</Text>
            <Text style={styles.modalText}>{updateTarget?.id}</Text>
            <TextInput
              style={styles.updateInput}
              value={updateDraft}
              onChangeText={setUpdateDraft}
              placeholder="Write a short public update"
              placeholderTextColor={theme.colors.muted}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => {
                  setUpdateReportId('');
                  setUpdateDraft('');
                }}
              >
                <Text style={styles.modalSecondaryText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary} onPress={sendPublicUpdate}>
                <Text style={styles.modalPrimaryText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(attachmentPreview)}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachmentPreview(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.attachmentPreviewHero}>
              <MaterialCommunityIcons
                name={
                  attachmentPreview?.attachment.toLowerCase().includes('photo')
                    ? 'image-outline'
                    : attachmentPreview?.attachment.toLowerCase().includes('voice')
                      ? 'waveform'
                      : 'file-document-outline'
                }
                size={44}
                color={adminBlue}
              />
            </View>
            <Text style={styles.modalTitle}>{attachmentPreview?.attachment ?? 'Attachment'}</Text>
            <Text style={styles.modalText}>{attachmentReport?.id}</Text>
            <Text style={styles.previewText}>
              {attachmentPreview?.attachment.toLowerCase().includes('photo')
                ? 'Photo preview placeholder. In production this would render the uploaded image.'
                : attachmentPreview?.attachment.toLowerCase().includes('voice')
                  ? 'Voice memo preview placeholder. In production this would include audio playback.'
                  : 'File preview placeholder. In production this would open or download the uploaded file.'}
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.modalPrimaryWide} onPress={() => setAttachmentPreview(null)}>
                <Text style={styles.modalPrimaryText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingTop: 48,
    paddingBottom: 36,
  },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: adminBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  brandCopy: {
    flex: 1,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  subtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  toolbar: {
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 11,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  searchBox: {
    minHeight: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    marginBottom: 9,
  },
  searchInput: {
    flex: 1,
    minHeight: 38,
    color: theme.colors.text,
    fontSize: 13,
    marginLeft: 8,
  },
  filterRow: {
    gap: 6,
    paddingBottom: 2,
  },
  filterChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  filterChipActive: {
    backgroundColor: adminBlue,
    borderColor: adminBlue,
  },
  filterChipText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  reportList: {
    gap: 10,
  },
  reportCard: {
    borderRadius: 18,
    backgroundColor: '#fff',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  reportTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  reportId: {
    color: adminBlue,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  reportTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 23,
  },
  reportMeta: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  reportHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusBadge: {
    minHeight: 30,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusActive: {
    backgroundColor: adminBlueSoft,
    borderColor: 'rgba(73, 101, 127, 0.2)',
  },
  statusWarning: {
    backgroundColor: 'rgba(162, 11, 11, 0.08)',
    borderColor: 'rgba(162, 11, 11, 0.22)',
  },
  statusComplete: {
    backgroundColor: 'rgba(46, 127, 24, 0.1)',
    borderColor: 'rgba(46, 127, 24, 0.22)',
  },
  statusBadgeText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: 13,
    paddingTop: 13,
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 13,
  },
  factItem: {
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    padding: 10,
  },
  factLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  factValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  assignmentBlock: {
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    padding: 11,
    marginBottom: 13,
  },
  attachmentList: {
    gap: 8,
    marginBottom: 13,
  },
  attachmentButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  attachmentIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: adminBlueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
  },
  noAttachmentsText: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiSuggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 12,
  },
  aiCopy: {
    flex: 1,
  },
  aiLabel: {
    color: adminBlue,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  aiValue: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 19,
  },
  inputLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 7,
    textTransform: 'uppercase',
  },
  departmentSelect: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
  },
  departmentSelectText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  departmentMenu: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
    padding: 6,
    marginTop: 8,
    gap: 4,
  },
  departmentOption: {
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  departmentOptionActive: {
    backgroundColor: adminBlue,
    borderColor: adminBlue,
  },
  departmentOptionText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  departmentOptionTextActive: {
    color: '#fff',
  },
  reportText: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 13,
  },
  noteInput: {
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 13,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  primaryAction: {
    flexGrow: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: citizenGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryAction: {
    flexGrow: 1,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(73, 101, 127, 0.25)',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: adminBlue,
    fontSize: 13,
    fontWeight: '900',
  },
  formMessage: {
    minHeight: 22,
    color: theme.colors.muted,
    fontWeight: '700',
    marginTop: 12,
    lineHeight: 19,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 18,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 14,
  },
  updateInput: {
    minHeight: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },
  attachmentPreviewHero: {
    height: 130,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  previewText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalSecondary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSecondaryText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  modalPrimary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: adminBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryWide: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: adminBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
