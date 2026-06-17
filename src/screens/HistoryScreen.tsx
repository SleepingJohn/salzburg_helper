import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CitizenReport, getResolvedReports, subscribeReports } from '../data/reports';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'History'>;

const brandRed = '#A20B0B';
const citizenGreen = '#2E7F18';

export default function HistoryScreen({ navigation }: Props) {
  const [resolvedIssues, setResolvedIssues] = useState<CitizenReport[]>(getResolvedReports());

  useEffect(() => {
    return subscribeReports(() => setResolvedIssues(getResolvedReports()));
  }, []);

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
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Resolved issues you created in the past.</Text>
        </View>

        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryNumber}>{resolvedIssues.length}</Text>
            <Text style={styles.summaryLabel}>Resolved reports</Text>
          </View>
          <View style={styles.summaryIcon}>
            <MaterialCommunityIcons name="check-decagram-outline" size={28} color="#fff" />
          </View>
        </View>

        <View style={styles.issueList}>
          {resolvedIssues.map(issue => (
            <View key={issue.id} style={styles.issueCard}>
              <View style={styles.cardTop}>
                <Text style={styles.issueId}>{issue.id}</Text>
                <View style={styles.resolvedPill}>
                  <MaterialCommunityIcons name="check" size={14} color={citizenGreen} />
                  <Text style={styles.resolvedText}>Resolved</Text>
                </View>
              </View>

              <Text style={styles.issueTitle}>{issue.title}</Text>
              <Text style={styles.issueSummary}>
                {issue.publicUpdates.find(update => update.sender === 'authority')?.message ??
                  issue.publicUpdates[0]?.message ??
                  issue.translatedMessage ??
                  issue.citizenMessage}
              </Text>

              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color={citizenGreen} />
                  <Text style={styles.detailText}>{issue.location}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="office-building-outline" size={16} color={citizenGreen} />
                  <Text style={styles.detailText}>{issue.department}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="calendar-plus" size={16} color={citizenGreen} />
                  <Text style={styles.detailText}>Created {issue.createdAt}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="calendar-check-outline" size={16} color={citizenGreen} />
                  <Text style={styles.detailText}>Resolved {issue.resolvedAt ?? issue.updatedAt}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Pressable style={styles.primaryButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </Pressable>
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
    marginBottom: 20,
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
  summaryCard: {
    minHeight: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryNumber: {
    color: '#000',
    fontSize: 30,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#8c8c8c',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  summaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: citizenGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  issueList: {
    gap: 15,
  },
  issueCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#8b7f7f',
    backgroundColor: '#fff',
    padding: 18,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  issueId: {
    flex: 1,
    color: citizenGreen,
    fontSize: 12,
    fontWeight: '800',
  },
  resolvedPill: {
    minHeight: 28,
    borderRadius: 18,
    backgroundColor: '#f0f7ed',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resolvedText: {
    color: citizenGreen,
    fontSize: 12,
    fontWeight: '800',
  },
  issueTitle: {
    color: '#000',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 7,
  },
  issueSummary: {
    color: '#8c8c8c',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 14,
  },
  detailGrid: {
    gap: 9,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    flex: 1,
    color: '#394050',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  primaryButton: {
    height: 46,
    borderRadius: 12,
    backgroundColor: brandRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  primaryButtonText: {
    color: '#fdfbfb',
    fontSize: 15,
    fontWeight: '600',
  },
});
