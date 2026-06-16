import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { listReports, statusLabels, subscribeReports } from '../data/reports';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

type SortMode = 'newest' | 'upvotes' | 'downvotes';

const figmaGreen = '#2E7F18';

type Issue = {
  id: string;
  title: string;
  author: string;
  location: string;
  createdAt: string;
  createdLabel: string;
  summary: string;
  upvotes: number;
  downvotes: number;
};

const issues: Issue[] = [
  {
    id: 'sal-2187',
    title: 'Loose paving stone near Mozartplatz',
    author: 'Anna K.',
    location: 'Mozartplatz',
    createdAt: '2026-06-16T09:30:00',
    createdLabel: 'Today, 09:30',
    summary: 'A stone is rocking near the crossing and people keep stepping around it.',
    upvotes: 42,
    downvotes: 3,
  },
  {
    id: 'sal-2179',
    title: 'Street light flickering',
    author: 'Jonas M.',
    location: 'Linzer Gasse',
    createdAt: '2026-06-15T19:10:00',
    createdLabel: 'Yesterday, 19:10',
    summary: 'Lamp outside house 12 switches off every few minutes after sunset.',
    upvotes: 28,
    downvotes: 1,
  },
  {
    id: 'sal-2164',
    title: 'Overflowing bin at bus stop',
    author: 'Mira S.',
    location: 'Mirabellplatz',
    createdAt: '2026-06-14T15:45:00',
    createdLabel: 'Jun 14, 15:45',
    summary: 'Waste is spreading onto the sidewalk next to the bus shelter.',
    upvotes: 19,
    downvotes: 6,
  },
  {
    id: 'sal-2142',
    title: 'Bike lane blocked by sign',
    author: 'David R.',
    location: 'Elisabethkai',
    createdAt: '2026-06-12T08:05:00',
    createdLabel: 'Jun 12, 08:05',
    summary: 'Temporary sign forces cyclists into car traffic during morning rush.',
    upvotes: 64,
    downvotes: 11,
  },
];

const sortOptions: { label: string; value: SortMode; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { label: 'Newest', value: 'newest', icon: 'clock-outline' },
  { label: 'Most upvoted', value: 'upvotes', icon: 'arrow-up-bold-outline' },
  { label: 'Most downvoted', value: 'downvotes', icon: 'arrow-down-bold-outline' },
];

export default function WelcomeScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [votes, setVotes] = useState<Record<string, 1 | -1 | 0>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [reports, setReports] = useState(listReports());

  useEffect(() => {
    return subscribeReports(() => setReports(listReports()));
  }, []);

  const createdIssues = useMemo<Issue[]>(
    () =>
      reports
        .filter(report => report.status !== 'resolved' && report.status !== 'rejected')
        .map(report => ({
          id: report.id,
          title: report.title,
          author: report.citizenName,
          location: report.location,
          createdAt: report.createdAt.startsWith('Today') ? `2026-06-16T${report.createdAt.split(', ')[1] ?? '10:24'}:00` : report.createdAt,
          createdLabel: report.createdAt,
          summary: `${report.issue} | ${statusLabels[report.status]} | ${report.department}`,
          upvotes: 0,
          downvotes: 0,
        })),
    [reports],
  );

  const filteredIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...createdIssues, ...issues]
      .filter(issue => {
        if (!normalizedQuery) {
          return true;
        }

        return [issue.title, issue.author, issue.location, issue.summary, issue.id]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .map(issue => ({
        ...issue,
        upvotes: issue.upvotes + (votes[issue.id] === 1 ? 1 : 0),
        downvotes: issue.downvotes + (votes[issue.id] === -1 ? 1 : 0),
      }))
      .sort((left, right) => {
        if (sortMode === 'upvotes') {
          return right.upvotes - left.upvotes;
        }

        if (sortMode === 'downvotes') {
          return right.downvotes - left.downvotes;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }, [createdIssues, query, sortMode, votes]);

  const updateVote = (issueId: string, vote: 1 | -1) => {
    setVotes(current => ({
      ...current,
      [issueId]: current[issueId] === vote ? 0 : vote,
    }));
  };

  const startIssue = () => {
    navigation.navigate('Record', {
      firstName: '',
      lastName: '',
      email: '',
      address: '',
    });
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.shell} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <View style={styles.brandBlock}>
            <Text style={styles.brandText}>
              <Text style={styles.brandAccent}>Salz</Text>Citizen
            </Text>
            <Text style={styles.brandSubtext}>Salzburg. We listen</Text>
          </View>
          <Pressable
            style={styles.moreButton}
            onPress={() => setMenuOpen(current => !current)}
            accessibilityLabel="Open menu"
          >
            <MaterialCommunityIcons name="menu" size={24} color="#111" />
          </Pressable>
          {menuOpen ? (
            <View style={styles.menuPanel}>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Tracking');
                }}
              >
                <MaterialCommunityIcons name="clipboard-text-clock-outline" size={19} color={figmaGreen} />
                <Text style={styles.menuItemText}>Status</Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('History');
                }}
              >
                <MaterialCommunityIcons name="history" size={19} color={figmaGreen} />
                <Text style={styles.menuItemText}>History</Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('AuthorityDashboard');
                }}
              >
                <MaterialCommunityIcons name="office-building-cog-outline" size={19} color={figmaGreen} />
                <Text style={styles.menuItemText}>Authority view</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.searchCard}>
          <View style={styles.searchLeft}>
            <MaterialCommunityIcons name="magnify" size={23} color={figmaGreen} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search issues, names, places"
              placeholderTextColor="#8b93a1"
              returnKeyType="search"
            />
          </View>
          <Pressable style={styles.searchAction} accessibilityLabel="Search">
            <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.sortHeader}>
          <Text style={styles.sectionTitle}>Sort issues</Text>
          <Text style={styles.resultCount}>{filteredIssues.length} shown</Text>
        </View>

        <View style={styles.sortGrid}>
          {sortOptions.map(option => {
            const active = sortMode === option.value;

            return (
              <Pressable
                key={option.value}
                style={[styles.sortButton, active && styles.sortButtonActive]}
                onPress={() => setSortMode(option.value)}
              >
                <MaterialCommunityIcons name={option.icon} size={18} color={active ? '#fff' : figmaGreen} />
                <Text style={[styles.sortButtonText, active && styles.sortButtonTextActive]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.reportButton} onPress={startIssue}>
          <MaterialCommunityIcons name="microphone-plus" size={22} color="#fff" />
          <Text style={styles.reportButtonText}>State an issue</Text>
        </Pressable>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Issue history</Text>
        </View>

        <View style={styles.issueList}>
          {filteredIssues.map(issue => {
            const selectedVote = votes[issue.id] ?? 0;

            return (
              <View key={issue.id} style={styles.issueCard}>
                <View style={styles.voteColumn}>
                  <Pressable
                    style={[styles.voteButton, selectedVote === 1 && styles.voteButtonActive]}
                    onPress={() => updateVote(issue.id, 1)}
                    accessibilityLabel={`Upvote ${issue.title}`}
                  >
                    <MaterialCommunityIcons
                      name="arrow-up-bold"
                      size={19}
                      color={selectedVote === 1 ? '#fff' : figmaGreen}
                    />
                  </Pressable>
                  <Text style={styles.voteCount}>{issue.upvotes - issue.downvotes}</Text>
                  <Pressable
                    style={[styles.voteButton, selectedVote === -1 && styles.downvoteButtonActive]}
                    onPress={() => updateVote(issue.id, -1)}
                    accessibilityLabel={`Downvote ${issue.title}`}
                  >
                    <MaterialCommunityIcons
                      name="arrow-down-bold"
                      size={19}
                      color={selectedVote === -1 ? '#fff' : theme.colors.danger}
                    />
                  </Pressable>
                </View>

                <View style={styles.issueBody}>
                  <View style={styles.issueMetaRow}>
                    <Text style={styles.issueId}>{issue.id}</Text>
                    <Text style={styles.issueDate}>{issue.createdLabel}</Text>
                  </View>
                  <Text style={styles.issueTitle}>{issue.title}</Text>
                  <Text style={styles.issueSummary}>{issue.summary}</Text>
                  <View style={styles.issueFooter}>
                    <View style={styles.footerItem}>
                      <MaterialCommunityIcons name="account-outline" size={15} color={theme.colors.muted} />
                      <Text style={styles.footerText}>{issue.author}</Text>
                    </View>
                    <View style={styles.footerItem}>
                      <MaterialCommunityIcons name="map-marker-outline" size={15} color={theme.colors.muted} />
                      <Text style={styles.footerText}>{issue.location}</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#fff',
  },
  shell: {
    paddingHorizontal: 11,
    paddingTop: 48,
    paddingBottom: 34,
  },
  header: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    zIndex: 5,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
  moreButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPanel: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 178,
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  menuItem: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  menuItemText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  brandBlock: {
    alignItems: 'center',
    paddingTop: 1,
  },
  brandText: {
    color: '#000',
    fontSize: 25,
    fontWeight: '800',
  },
  brandAccent: {
    color: '#a20b0b',
  },
  brandSubtext: {
    color: '#d3d1d1',
    fontSize: 12,
    marginTop: 5,
  },
  searchCard: {
    minHeight: 70,
    borderRadius: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
    marginBottom: 25,
  },
  searchLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  searchInput: {
    flex: 1,
    color: '#394050',
    fontSize: 16,
    marginLeft: 12,
    minHeight: 48,
  },
  searchAction: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: figmaGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sortHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  resultCount: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  sortGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  sortButton: {
    minHeight: 50,
    borderRadius: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  sortButtonActive: {
    backgroundColor: figmaGreen,
  },
  sortButtonText: {
    color: '#394050',
    fontSize: 13,
    fontWeight: '700',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  reportButton: {
    minHeight: 56,
    borderRadius: 40,
    backgroundColor: figmaGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
    marginBottom: 30,
  },
  reportButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardLink: {
    color: figmaGreen,
    fontSize: 13,
    fontWeight: '800',
  },
  issueList: {
    gap: 15,
  },
  issueCard: {
    flexDirection: 'row',
    borderRadius: 32,
    backgroundColor: '#fff',
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  voteColumn: {
    width: 48,
    alignItems: 'center',
    marginRight: 12,
  },
  voteButton: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: '#f5f8f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteButtonActive: {
    backgroundColor: figmaGreen,
  },
  downvoteButtonActive: {
    backgroundColor: theme.colors.danger,
  },
  voteCount: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
    marginVertical: 8,
  },
  issueBody: {
    flex: 1,
    minWidth: 0,
  },
  issueMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 5,
  },
  issueId: {
    color: figmaGreen,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  issueDate: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  issueTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
    marginBottom: 6,
  },
  issueSummary: {
    color: '#596171',
    fontSize: 14,
    lineHeight: 20,
  },
  issueFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
});
