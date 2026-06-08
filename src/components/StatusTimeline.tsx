import { StyleSheet, Text, View } from 'react-native';
import theme from '../theme';
import { TrackingStatus } from '../api/mockAI';

export default function StatusTimeline({ statuses }: { statuses: TrackingStatus[] }) {
  return (
    <View style={styles.container}>
      {statuses.map((item, index) => (
        <View key={item.label} style={styles.row}>
          <View style={styles.markerColumn}>
            <View style={[styles.dot, item.completed && styles.dotActive]} />
            {index < statuses.length - 1 && <View style={styles.line} />}
          </View>
          <View style={styles.detailColumn}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, item.completed && styles.labelActive]}>{item.label}</Text>
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  markerColumn: {
    width: 24,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border,
    marginTop: 4,
  },
  detailColumn: {
    flex: 1,
    paddingLeft: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.text,
  },
  labelActive: {
    color: theme.colors.primary,
  },
  timestamp: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    color: theme.colors.muted,
    lineHeight: 20,
  },
});
