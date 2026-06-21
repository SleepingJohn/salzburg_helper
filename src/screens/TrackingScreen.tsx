import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Linking, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  addCitizenReply,
  CitizenReport,
  ConversationAttachment,
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
  const [reports, setReports] = useState<CitizenReport[]>(listReports());
  const [selectedReportId, setSelectedReportId] = useState(reportId ?? '');
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<ConversationAttachment[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState<ConversationAttachment | null>(null);
  const [conversationCollapsed, setConversationCollapsed] = useState(false);

  useEffect(() => {
    setSelectedReportId(reportId ?? '');
  }, [reportId]);

  useEffect(() => subscribeReports(() => setReports(listReports())), []);

  const openReports = reports.filter(item => item.status !== 'resolved' && item.status !== 'rejected');
  const report =
    reports.find(item => item.id === selectedReportId) ??
    openReports[0] ??
    reports[0];
  const requestedReportMissing = Boolean(selectedReportId) && !reports.some(item => item.id === selectedReportId);

  if (!report) {
    return (
      <SafeAreaView style={styles.page}>
        <View style={styles.emptyState}>
          <Text style={styles.title}>No reports yet</Text>
          <Text style={styles.subtitle}>Create a report first, then its status will appear here.</Text>
          <Pressable style={styles.primaryButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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

        {requestedReportMissing ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>That reference was not found. Showing your latest open report instead.</Text>
          </View>
        ) : null}

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
                        setSelectedReportId(openReport.id);
                        setSelectorOpen(false);
                        setReplyDraft('');
                        setReplyAttachments([]);
                        setReplyMessage('');
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
          <Pressable
            style={styles.collapsibleHeader}
            onPress={() => setConversationCollapsed(current => !current)}
          >
            <Text style={styles.sectionTitleInline}>Updates from the city</Text>
            <MaterialCommunityIcons
              name={conversationCollapsed ? 'chevron-down' : 'chevron-up'}
              size={22}
              color={citizenGreen}
            />
          </Pressable>
          {!conversationCollapsed ? (
            <>
              <View style={styles.updateList}>
                {report.publicUpdates.length ? (
                  report.publicUpdates.map(update => (
                    <View
                      key={update.id}
                      style={[styles.updateItem, update.sender === 'citizen' && styles.updateItemCitizen]}
                    >
                      <View style={[styles.updateIcon, update.sender === 'citizen' && styles.updateIconCitizen]}>
                        <MaterialCommunityIcons
                          name={update.sender === 'citizen' ? 'account-outline' : 'city-variant-outline'}
                          size={16}
                          color={citizenGreen}
                        />
                      </View>
                      <View style={styles.updateCopy}>
                        <View style={styles.updateHeader}>
                          <Text style={styles.updateDate}>
                            {update.sender === 'citizen' ? 'You' : 'Stadt Salzburg'} | {update.createdAt}
                          </Text>
                          {update.status ? <Text style={styles.updateStatus}>{statusLabels[update.status]}</Text> : null}
                        </View>
                        <Text style={styles.updateText}>{update.message}</Text>
                        {update.attachments?.length ? (
                          <View style={styles.replyAttachmentList}>
                            {update.attachments.map((attachment, index) => (
                              <Pressable
                                key={`${update.id}-${attachment.name}-${index}`}
                                style={styles.replyAttachmentPill}
                                onPress={() => setAttachmentPreview(attachment)}
                              >
                                <MaterialCommunityIcons
                                  name={attachment.type === 'image' ? 'image-outline' : 'file-document-outline'}
                                  size={14}
                                  color={citizenGreen}
                                />
                                <Text style={styles.replyAttachmentText}>{attachment.name}</Text>
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyUpdateText}>No city updates yet.</Text>
                )}
              </View>

              {report.status !== 'resolved' && report.status !== 'rejected' ? (
                <View style={styles.replyBox}>
              <Text style={styles.replyLabel}>Reply to the city</Text>
              <TextInput
                style={styles.replyInput}
                value={replyDraft}
                onChangeText={setReplyDraft}
                placeholder="Write a message"
                placeholderTextColor="#8c8c8c"
                multiline
              />
              {replyAttachments.length ? (
                <View style={styles.replyAttachmentList}>
                  {replyAttachments.map((attachment, index) => (
                    <Pressable
                      key={`${attachment.name}-${index}`}
                      style={styles.replyAttachmentPill}
                      onPress={() => setAttachmentPreview(attachment)}
                    >
                      <MaterialCommunityIcons
                        name={attachment.type === 'image' ? 'image-outline' : 'file-document-outline'}
                        size={14}
                        color={citizenGreen}
                      />
                      <Text style={styles.replyAttachmentText}>{attachment.name}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <View style={styles.replyActions}>
                <Pressable style={styles.replyToolButton} onPress={async () => {
                  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

                  if (!permission.granted) {
                    setReplyMessage('Photo permission was not granted.');
                    return;
                  }

                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    quality: 0.8,
                  });

                  if (!result.canceled && result.assets[0]) {
                    setReplyAttachments(current => [
                      ...current,
                      { name: result.assets[0].fileName ?? 'photo attachment', type: 'image', uri: result.assets[0].uri },
                    ]);
                    setReplyMessage('Image attached.');
                  }
                }}>
                  <MaterialCommunityIcons name="image-plus-outline" size={17} color={citizenGreen} />
                  <Text style={styles.replyToolText}>Image</Text>
                </Pressable>
                <Pressable style={styles.replyToolButton} onPress={async () => {
                  const result = await DocumentPicker.getDocumentAsync({
                    copyToCacheDirectory: true,
                  });

                  if (!result.canceled && result.assets[0]) {
                    setReplyAttachments(current => [
                      ...current,
                      { name: result.assets[0].name, type: 'document', uri: result.assets[0].uri },
                    ]);
                    setReplyMessage('Document attached.');
                  }
                }}>
                  <MaterialCommunityIcons name="file-upload-outline" size={17} color={citizenGreen} />
                  <Text style={styles.replyToolText}>Document</Text>
                </Pressable>
                <Pressable style={styles.replySendButton} onPress={() => {
                  if (!replyDraft.trim() && replyAttachments.length === 0) {
                    setReplyMessage('Write a message or attach a file before sending.');
                    return;
                  }

                  addCitizenReply(report.id, replyDraft, replyAttachments);
                  setReplyDraft('');
                  setReplyAttachments([]);
                  setReplyMessage('Reply sent to Stadt Salzburg.');
                }}>
                  <MaterialCommunityIcons name="send-outline" size={17} color="#fff" />
                  <Text style={styles.replySendText}>Send</Text>
                </Pressable>
              </View>
              <Text style={styles.replyMessage}>{replyMessage}</Text>
                </View>
              ) : null}
            </>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.popToTop()}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>

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
                name={attachmentPreview?.type === 'image' ? 'image-outline' : 'file-document-outline'}
                size={44}
                color={citizenGreen}
              />
            </View>
            <Text style={styles.modalTitle}>{attachmentPreview?.name ?? 'Attachment'}</Text>
            <Text style={styles.previewText}>
              {attachmentPreview?.type === 'image'
                ? 'Image quickview placeholder. In production this would render the uploaded image.'
                : 'Document quickview placeholder. In production this would render a preview or file details.'}
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={async () => {
                  if (attachmentPreview?.uri) {
                    try {
                      await Linking.openURL(attachmentPreview.uri);
                    } catch {
                      setReplyMessage(`Download ready for ${attachmentPreview.name}.`);
                    }
                    return;
                  }

                  setReplyMessage(`Download ready for ${attachmentPreview?.name ?? 'attachment'}.`);
                }}
              >
                <MaterialCommunityIcons name="download-outline" size={17} color="#000" />
                <Text style={styles.modalSecondaryText}>Download</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary} onPress={() => setAttachmentPreview(null)}>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 12,
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
  noticeCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7d7d7',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 20,
  },
  noticeText: {
    color: '#394050',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
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
  sectionTitleInline: {
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  collapsibleHeader: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  updateItemCitizen: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateIconCitizen: {
    backgroundColor: '#fff',
  },
  updateCopy: {
    flex: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 7,
    marginBottom: 3,
  },
  updateDate: {
    color: '#8c8c8c',
    fontSize: 12,
    fontWeight: '600',
  },
  updateStatus: {
    borderRadius: 12,
    backgroundColor: '#f0f7ed',
    color: citizenGreen,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  updateText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  replyBox: {
    borderTopWidth: 1,
    borderTopColor: '#ececec',
    marginTop: 18,
    paddingTop: 16,
  },
  replyLabel: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  replyInput: {
    minHeight: 82,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7d7d7',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  replyAttachmentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },
  replyAttachmentPill: {
    minHeight: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7d7d7',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
  },
  replyAttachmentText: {
    color: citizenGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  replyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  replyToolButton: {
    minHeight: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7d7d7',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  replyToolText: {
    color: citizenGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  replySendButton: {
    flexGrow: 1,
    minHeight: 38,
    borderRadius: 12,
    backgroundColor: citizenGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  replySendText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  replyMessage: {
    minHeight: 18,
    color: '#8c8c8c',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
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
  attachmentPreviewHero: {
    height: 130,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    color: '#000',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewText: {
    color: '#000',
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
    borderColor: '#d7d7d7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalSecondaryText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  modalPrimary: {
    flex: 1,
    minHeight: 44,
    borderRadius: 22,
    backgroundColor: citizenGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
