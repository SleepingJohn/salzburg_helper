import { useEffect, useMemo, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { listReports, statusLabels, subscribeReports } from '../data/reports';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

type FilterMode = 'newest' | 'upvotes' | 'mine';
type UpvoteSortDirection = 'desc' | 'asc';
type AdvancedSearchFilters = {
  title: string;
  location: string;
  author: string;
  department: string;
  status: string;
  date: string;
};
type AdvancedDropdown = 'department' | 'status' | 'date' | '';

const figmaGreen = '#2E7F18';

type Issue = {
  id: string;
  title: string;
  author: string;
  location: string;
  createdAt: string;
  createdLabel: string;
  summary: string;
  description: string;
  statusLabel: string;
  department?: string;
  upvotes: number;
  downvotes: number;
  isMine: boolean;
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
    description:
      'A loose paving stone near the crossing is rocking when people step on it. Several pedestrians are avoiding the spot and it could become a trip hazard.',
    statusLabel: 'Community report',
    department: 'Road Maintenance',
    upvotes: 42,
    downvotes: 3,
    isMine: false,
  },
  {
    id: 'sal-2179',
    title: 'Street light flickering',
    author: 'Jonas M.',
    location: 'Linzer Gasse',
    createdAt: '2026-06-15T19:10:00',
    createdLabel: 'Yesterday, 19:10',
    summary: 'Lamp outside house 12 switches off every few minutes after sunset.',
    description:
      'The street light outside house 12 flickers after sunset and repeatedly turns off, leaving the entrance area poorly lit.',
    statusLabel: 'Community report',
    department: 'Public Lighting',
    upvotes: 28,
    downvotes: 1,
    isMine: false,
  },
  {
    id: 'sal-2164',
    title: 'Overflowing bin at bus stop',
    author: 'Mira S.',
    location: 'Mirabellplatz',
    createdAt: '2026-06-14T15:45:00',
    createdLabel: 'Jun 14, 15:45',
    summary: 'Waste is spreading onto the sidewalk next to the bus shelter.',
    description:
      'The bin at the bus stop is full and waste is already spreading onto the sidewalk. The area needs cleanup and an empty bin.',
    statusLabel: 'Community report',
    department: 'Waste Management',
    upvotes: 19,
    downvotes: 6,
    isMine: false,
  },
  {
    id: 'sal-2142',
    title: 'Bike lane blocked by sign',
    author: 'David R.',
    location: 'Elisabethkai',
    createdAt: '2026-06-12T08:05:00',
    createdLabel: 'Jun 12, 08:05',
    summary: 'Temporary sign forces cyclists into car traffic during morning rush.',
    description:
      'A temporary sign blocks the bike lane on Elisabethkai and forces cyclists into car traffic during busy morning hours.',
    statusLabel: 'Community report',
    department: 'Traffic Management',
    upvotes: 64,
    downvotes: 11,
    isMine: false,
  },
];

const filterOptions: { label: string; value: FilterMode; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { label: 'Newest', value: 'newest', icon: 'clock-outline' },
  { label: 'Upvotes', value: 'upvotes', icon: 'arrow-up-bold-outline' },
  { label: 'My issues', value: 'mine', icon: 'clipboard-account-outline' },
];

const emptyAdvancedFilters: AdvancedSearchFilters = {
  title: '',
  location: '',
  author: '',
  department: '',
  status: '',
  date: '',
};

const weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getSortableDate(label: string) {
  if (label.startsWith('Today')) {
    const today = new Date();
    const [hours = '00', minutes = '00'] = label.split(', ')[1]?.split(':') ?? [];
    today.setHours(Number(hours), Number(minutes), 0, 0);
    return today.toISOString();
  }

  const parsed = new Date(label);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

function getDateFilterValue(createdAt: string) {
  return createdAt.slice(0, 10);
}

function getDateOptionLabel(value: string) {
  const today = new Date().toISOString().slice(0, 10);

  if (value === today) {
    return 'Today';
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getUniqueOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthTitle(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayBasedOffset = (firstDay.getDay() + 6) % 7;
  const days: Array<{ label: string; value: string; inMonth: boolean }> = [];

  for (let index = 0; index < mondayBasedOffset; index += 1) {
    days.push({ label: '', value: `empty-${index}`, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    days.push({ label: String(day), value: formatDateValue(date), inMonth: true });
  }

  return days;
}

export default function WelcomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters>(emptyAdvancedFilters);
  const [advancedDropdownOpen, setAdvancedDropdownOpen] = useState<AdvancedDropdown>('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [filterMode, setFilterMode] = useState<FilterMode>('newest');
  const [upvoteSortDirection, setUpvoteSortDirection] = useState<UpvoteSortDirection>('desc');
  const [votes, setVotes] = useState<Record<string, 1 | -1 | 0>>({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedIssueId, setExpandedIssueId] = useState('');
  const [reports, setReports] = useState(listReports());
  const compactSort = width < 380;
  const tightSort = width < 340;

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
          createdAt: getSortableDate(report.createdAt),
          createdLabel: report.createdAt,
          summary: `${report.issue} | ${statusLabels[report.status]} | ${report.department}`,
          description: report.citizenMessage || report.translatedMessage,
          statusLabel: statusLabels[report.status],
          department: report.department,
          upvotes: 0,
          downvotes: 0,
          isMine: true,
        })),
    [reports],
  );

  const filteredIssues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const normalizedAdvancedFilters = {
      title: advancedFilters.title.trim().toLowerCase(),
      location: advancedFilters.location.trim().toLowerCase(),
      author: advancedFilters.author.trim().toLowerCase(),
      department: advancedFilters.department.trim().toLowerCase(),
      status: advancedFilters.status.trim().toLowerCase(),
      date: advancedFilters.date.trim(),
    };

    return [...createdIssues, ...issues]
      .filter(issue => (filterMode === 'mine' ? issue.isMine : true))
      .filter(issue => {
        if (!normalizedQuery) {
          return true;
        }

        return [issue.title, issue.author, issue.location, issue.summary, issue.id]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .filter(issue => {
        const searchable = {
          title: issue.title.toLowerCase(),
          location: issue.location.toLowerCase(),
          author: issue.author.toLowerCase(),
          department: (issue.department ?? '').toLowerCase(),
          status: issue.statusLabel.toLowerCase(),
          date: getDateFilterValue(issue.createdAt),
        };

        return Object.entries(normalizedAdvancedFilters).every(([key, value]) => {
          if (!value) {
            return true;
          }

          return searchable[key as keyof typeof searchable].includes(value);
        });
      })
      .map(issue => ({
        ...issue,
        upvotes: issue.upvotes + (votes[issue.id] === 1 ? 1 : 0),
        downvotes: issue.downvotes + (votes[issue.id] === -1 ? 1 : 0),
      }))
      .sort((left, right) => {
        if (filterMode === 'upvotes') {
          const leftScore = left.upvotes - left.downvotes;
          const rightScore = right.upvotes - right.downvotes;
          return upvoteSortDirection === 'desc' ? rightScore - leftScore : leftScore - rightScore;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }, [advancedFilters, createdIssues, filterMode, query, upvoteSortDirection, votes]);

  const advancedFilterCount = Object.values(advancedFilters).filter(value => value.trim()).length;
  const allIssues = useMemo(() => [...createdIssues, ...issues], [createdIssues]);
  const departmentOptions = useMemo(
    () => getUniqueOptions(allIssues.map(issue => issue.department ?? '')),
    [allIssues],
  );
  const statusOptions = useMemo(
    () => getUniqueOptions(allIssues.map(issue => issue.statusLabel)),
    [allIssues],
  );
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);

  const updateAdvancedFilter = (key: keyof AdvancedSearchFilters, value: string) => {
    setAdvancedFilters(current => ({
      ...current,
      [key]: value,
    }));
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters(emptyAdvancedFilters);
    setAdvancedDropdownOpen('');
  };

  const selectFilter = (mode: FilterMode) => {
    if (mode === 'upvotes') {
      if (filterMode === 'upvotes') {
        setUpvoteSortDirection(current => (current === 'desc' ? 'asc' : 'desc'));
      } else {
        setUpvoteSortDirection('desc');
      }
    }

    setFilterMode(mode);
  };

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
            {query ? (
              <Pressable style={styles.clearSearchButton} onPress={() => setQuery('')} accessibilityLabel="Clear search">
                <MaterialCommunityIcons name="close" size={15} color="#394050" />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            style={[styles.searchAction, advancedSearchOpen && styles.searchActionActive]}
            onPress={() => setAdvancedSearchOpen(current => !current)}
            accessibilityLabel={advancedSearchOpen ? 'Close advanced search' : 'Open advanced search'}
          >
            <MaterialCommunityIcons name="tune-variant" size={19} color="#fff" />
            {advancedFilterCount ? (
              <View style={styles.searchFilterBadge}>
                <Text style={styles.searchFilterBadgeText}>{advancedFilterCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {advancedSearchOpen ? (
          <View style={styles.advancedPanel}>
            <View style={styles.advancedHeader}>
              <Text style={styles.advancedTitle}>Search specific parts</Text>
              {advancedFilterCount ? (
                <Pressable onPress={clearAdvancedFilters} accessibilityLabel="Clear advanced search">
                  <Text style={styles.clearFiltersText}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
            <View style={styles.advancedGrid}>
              <View style={styles.advancedField}>
                <Text style={styles.advancedLabel}>Title</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={advancedFilters.title}
                  onChangeText={value => updateAdvancedFilter('title', value)}
                  placeholder="Street light"
                  placeholderTextColor="#8b93a1"
                />
              </View>
              <View style={styles.advancedField}>
                <Text style={styles.advancedLabel}>Location</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={advancedFilters.location}
                  onChangeText={value => updateAdvancedFilter('location', value)}
                  placeholder="Mirabellplatz"
                  placeholderTextColor="#8b93a1"
                />
              </View>
              <View style={styles.advancedField}>
                <Text style={styles.advancedLabel}>Author</Text>
                <TextInput
                  style={styles.advancedInput}
                  value={advancedFilters.author}
                  onChangeText={value => updateAdvancedFilter('author', value)}
                  placeholder="Anna"
                  placeholderTextColor="#8b93a1"
                />
              </View>
              <View style={styles.advancedField}>
                <Text style={styles.advancedLabel}>Department</Text>
                <Pressable
                  style={styles.advancedSelect}
                  onPress={() =>
                    setAdvancedDropdownOpen(current => (current === 'department' ? '' : 'department'))
                  }
                  accessibilityLabel="Select department"
                >
                  <Text style={[styles.advancedSelectText, !advancedFilters.department && styles.advancedSelectPlaceholder]}>
                    {advancedFilters.department || 'Any department'}
                  </Text>
                  <MaterialCommunityIcons
                    name={advancedDropdownOpen === 'department' ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={figmaGreen}
                  />
                </Pressable>
                {advancedDropdownOpen === 'department' ? (
                  <View style={styles.advancedMenu}>
                    {['', ...departmentOptions].map(option => (
                      <Pressable
                        key={option || 'any-department'}
                        style={[styles.advancedOption, advancedFilters.department === option && styles.advancedOptionActive]}
                        onPress={() => {
                          updateAdvancedFilter('department', option);
                          setAdvancedDropdownOpen('');
                        }}
                      >
                        <Text
                          style={[
                            styles.advancedOptionText,
                            advancedFilters.department === option && styles.advancedOptionTextActive,
                          ]}
                        >
                          {option || 'Any department'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
              <View style={styles.advancedField}>
                <Text style={styles.advancedLabel}>Status</Text>
                <Pressable
                  style={styles.advancedSelect}
                  onPress={() => setAdvancedDropdownOpen(current => (current === 'status' ? '' : 'status'))}
                  accessibilityLabel="Select status"
                >
                  <Text style={[styles.advancedSelectText, !advancedFilters.status && styles.advancedSelectPlaceholder]}>
                    {advancedFilters.status || 'Any status'}
                  </Text>
                  <MaterialCommunityIcons
                    name={advancedDropdownOpen === 'status' ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={figmaGreen}
                  />
                </Pressable>
                {advancedDropdownOpen === 'status' ? (
                  <View style={styles.advancedMenu}>
                    {['', ...statusOptions].map(option => (
                      <Pressable
                        key={option || 'any-status'}
                        style={[styles.advancedOption, advancedFilters.status === option && styles.advancedOptionActive]}
                        onPress={() => {
                          updateAdvancedFilter('status', option);
                          setAdvancedDropdownOpen('');
                        }}
                      >
                        <Text
                          style={[
                            styles.advancedOptionText,
                            advancedFilters.status === option && styles.advancedOptionTextActive,
                          ]}
                        >
                          {option || 'Any status'}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
              <View style={styles.advancedField}>
                <Text style={styles.advancedLabel}>Date</Text>
                <Pressable
                  style={styles.advancedSelect}
                  onPress={() => setAdvancedDropdownOpen(current => (current === 'date' ? '' : 'date'))}
                  accessibilityLabel="Select date"
                >
                  <Text style={[styles.advancedSelectText, !advancedFilters.date && styles.advancedSelectPlaceholder]}>
                    {advancedFilters.date ? getDateOptionLabel(advancedFilters.date) : 'Any date'}
                  </Text>
                  <MaterialCommunityIcons
                    name={advancedDropdownOpen === 'date' ? 'calendar-collapse-horizontal' : 'calendar-month-outline'}
                    size={18}
                    color={figmaGreen}
                  />
                </Pressable>
                {advancedDropdownOpen === 'date' ? (
                  <View style={styles.calendarPanel}>
                    <View style={styles.calendarHeader}>
                      <Pressable
                        style={styles.calendarNavButton}
                        onPress={() => setCalendarMonth(current => addMonths(current, -1))}
                        accessibilityLabel="Previous month"
                      >
                        <MaterialCommunityIcons name="chevron-left" size={18} color={figmaGreen} />
                      </Pressable>
                      <Text style={styles.calendarTitle}>{getMonthTitle(calendarMonth)}</Text>
                      <Pressable
                        style={styles.calendarNavButton}
                        onPress={() => setCalendarMonth(current => addMonths(current, 1))}
                        accessibilityLabel="Next month"
                      >
                        <MaterialCommunityIcons name="chevron-right" size={18} color={figmaGreen} />
                      </Pressable>
                    </View>
                    <View style={styles.weekdayRow}>
                      {weekdayLabels.map((label, index) => (
                        <Text key={`${label}-${index}`} style={styles.weekdayText}>{label}</Text>
                      ))}
                    </View>
                    <View style={styles.calendarGrid}>
                      {calendarDays.map(day => {
                        const selected = advancedFilters.date === day.value;

                        return (
                          <Pressable
                            key={day.value}
                            style={[
                              styles.calendarDay,
                              !day.inMonth && styles.calendarDayEmpty,
                              selected && styles.calendarDaySelected,
                            ]}
                            disabled={!day.inMonth}
                            onPress={() => {
                              updateAdvancedFilter('date', day.value);
                              setAdvancedDropdownOpen('');
                            }}
                          >
                            <Text style={[styles.calendarDayText, selected && styles.calendarDayTextSelected]}>
                              {day.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                    <Pressable
                      style={styles.clearDateButton}
                      onPress={() => {
                        updateAdvancedFilter('date', '');
                        setAdvancedDropdownOpen('');
                      }}
                    >
                      <Text style={styles.clearDateText}>Any date</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.sortHeader}>
          <Text style={styles.sectionTitle}>Sort issues</Text>
          <Text style={styles.resultCount}>{filteredIssues.length} shown</Text>
        </View>

        <View style={styles.sortGrid}>
          {filterOptions.map(option => {
            const active = filterMode === option.value;
            const label =
              option.value === 'upvotes' && active
                ? upvoteSortDirection === 'desc'
                  ? 'Most votes'
                  : 'Least votes'
                : option.label;
            const icon =
              option.value === 'upvotes' && active && upvoteSortDirection === 'asc'
                ? 'arrow-down-bold-outline'
                : option.icon;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.sortButton,
                  compactSort && styles.sortButtonCompact,
                  tightSort && styles.sortButtonTight,
                  active && styles.sortButtonActive,
                ]}
                onPress={() => selectFilter(option.value)}
              >
                <MaterialCommunityIcons name={icon} size={compactSort ? 14 : 18} color={active ? '#fff' : figmaGreen} />
                <Text
                  style={[
                    styles.sortButtonText,
                    compactSort && styles.sortButtonTextCompact,
                    tightSort && styles.sortButtonTextTight,
                    active && styles.sortButtonTextActive,
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.reportButton} onPress={startIssue}>
          <MaterialCommunityIcons name="plus" size={22} color="#fff" />
          <Text style={styles.reportButtonText}>State an issue</Text>
        </Pressable>

        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Issue history</Text>
        </View>

        <View style={styles.issueList}>
          {filteredIssues.length ? filteredIssues.map(issue => {
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

                <Pressable
                  style={styles.issueBody}
                  onPress={() => setExpandedIssueId(current => (current === issue.id ? '' : issue.id))}
                  accessibilityLabel={`${expandedIssueId === issue.id ? 'Collapse' : 'Open'} ${issue.title}`}
                >
                  <View style={styles.issueMetaRow}>
                    <Text style={styles.issueId}>{issue.id}</Text>
                    <View style={styles.issueDateBlock}>
                      <Text style={styles.issueDate}>{issue.createdLabel}</Text>
                      <MaterialCommunityIcons
                        name={expandedIssueId === issue.id ? 'chevron-up' : 'chevron-down'}
                        size={17}
                        color={theme.colors.muted}
                      />
                    </View>
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
                  {expandedIssueId === issue.id ? (
                    <View style={styles.issuePreview}>
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Status</Text>
                        <Text style={styles.previewValue}>{issue.statusLabel}</Text>
                      </View>
                      {issue.department ? (
                        <View style={styles.previewRow}>
                          <Text style={styles.previewLabel}>Department</Text>
                          <Text style={styles.previewValue}>{issue.department}</Text>
                        </View>
                      ) : null}
                      <View style={styles.previewRow}>
                        <Text style={styles.previewLabel}>Location</Text>
                        <Text style={styles.previewValue}>{issue.location}</Text>
                      </View>
                      <Text style={styles.previewDescription}>{issue.description}</Text>
                    </View>
                  ) : null}
                </Pressable>
              </View>
            );
          }) : (
            <View style={styles.emptyIssues}>
              <Text style={styles.emptyIssuesText}>No open issues found.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {menuOpen ? (
        <>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)} accessibilityLabel="Close menu" />
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
        </>
      ) : null}
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
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  menuPanel: {
    position: 'absolute',
    top: 90,
    right: 11,
    width: 178,
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
    zIndex: 11,
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
  clearSearchButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(57, 64, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
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
  searchActionActive: {
    backgroundColor: '#111827',
  },
  searchFilterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  searchFilterBadgeText: {
    color: figmaGreen,
    fontSize: 10,
    fontWeight: '900',
  },
  advancedPanel: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e6ebef',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 20,
  },
  advancedHeader: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  advancedTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },
  clearFiltersText: {
    color: figmaGreen,
    fontSize: 13,
    fontWeight: '900',
  },
  advancedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  advancedField: {
    flexGrow: 1,
    flexBasis: 145,
    gap: 6,
  },
  advancedLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  advancedInput: {
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e8df',
    backgroundColor: '#f8fafc',
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 11,
  },
  advancedSelect: {
    minHeight: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e8df',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  advancedSelectText: {
    flex: 1,
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  advancedSelectPlaceholder: {
    color: '#8b93a1',
  },
  advancedMenu: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e3e8df',
    backgroundColor: '#fff',
    padding: 5,
    gap: 4,
  },
  advancedOption: {
    minHeight: 34,
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 9,
  },
  advancedOptionActive: {
    backgroundColor: figmaGreen,
  },
  advancedOptionText: {
    color: '#394050',
    fontSize: 12,
    fontWeight: '800',
  },
  advancedOptionTextActive: {
    color: '#fff',
  },
  calendarPanel: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e3e8df',
    backgroundColor: '#fff',
    padding: 10,
    gap: 8,
  },
  calendarHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  calendarNavButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTitle: {
    flex: 1,
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayText: {
    width: `${100 / 7}%`,
    color: theme.colors.muted,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  calendarDayEmpty: {
    opacity: 0,
  },
  calendarDaySelected: {
    backgroundColor: figmaGreen,
  },
  calendarDayText: {
    color: '#394050',
    fontSize: 12,
    fontWeight: '800',
  },
  calendarDayTextSelected: {
    color: '#fff',
  },
  clearDateButton: {
    minHeight: 32,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearDateText: {
    color: figmaGreen,
    fontSize: 12,
    fontWeight: '900',
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
    gap: 6,
    marginBottom: 20,
  },
  sortButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 44,
    borderRadius: 40,
    backgroundColor: '#fff',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 2,
  },
  sortButtonCompact: {
    minHeight: 40,
    paddingHorizontal: 5,
    gap: 3,
  },
  sortButtonTight: {
    paddingHorizontal: 3,
    gap: 2,
  },
  sortButtonActive: {
    backgroundColor: figmaGreen,
  },
  sortButtonText: {
    flexShrink: 1,
    minWidth: 0,
    color: '#394050',
    fontSize: 11,
    fontWeight: '700',
  },
  sortButtonTextCompact: {
    fontSize: 10,
  },
  sortButtonTextTight: {
    fontSize: 9,
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
    gap: 6,
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
  emptyIssues: {
    minHeight: 80,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  emptyIssuesText: {
    color: theme.colors.muted,
    fontSize: 14,
    fontWeight: '700',
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
  issueDateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
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
  issuePreview: {
    borderTopWidth: 1,
    borderTopColor: '#eef1f4',
    marginTop: 14,
    paddingTop: 13,
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  previewLabel: {
    width: 82,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  previewValue: {
    flex: 1,
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  previewDescription: {
    color: '#394050',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
    marginTop: 2,
  },
});
