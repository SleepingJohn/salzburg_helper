import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

const brandRed = '#A20B0B';
const successGreen = '#34C759';

export default function SuccessScreen({ route, navigation }: Props) {
  const { location, reportId } = route.params;
  const displayLocation = location && location !== 'Auto-detected' ? location : 'Faberstrasse 10\n5020 Salzburg';

  return (
    <SafeAreaView style={styles.page}>
      <Image
        source={require('../images/salzburg-panorama-spring-hd.jpg')}
        style={styles.heroImage}
        resizeMode="cover"
      />

      <View style={styles.checkCircle}>
        <MaterialCommunityIcons name="check" size={45} color="#fff" />
      </View>

      <View style={styles.messageBlock}>
        <Text style={styles.title}>Issue Reported!</Text>
        <Text style={styles.subtitle}>Your report has been successfully submitted.</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Reference ID</Text>
          <Text style={styles.detailValue}>{reportId}</Text>
        </View>
        <View style={styles.detailRowTall}>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{displayLocation}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('Tracking', { reportId })}>
          <Text style={styles.primaryButtonText}>View Status</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  heroImage: {
    width: '100%',
    height: 241,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  checkCircle: {
    position: 'absolute',
    top: 222,
    left: '50%',
    marginLeft: -31.5,
    width: 63,
    height: 63,
    borderRadius: 153,
    backgroundColor: successGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBlock: {
    width: 194,
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: 55,
  },
  title: {
    color: '#1e1f2e',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    width: 175,
    color: '#8c8c8c',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    textAlign: 'center',
  },
  details: {
    marginTop: 55,
    marginHorizontal: 49,
    gap: 0,
  },
  detailRow: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 54,
  },
  detailRowTall: {
    minHeight: 71,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 54,
  },
  detailLabel: {
    width: 96,
    color: '#000',
    fontSize: 15,
    fontWeight: '600',
  },
  detailValue: {
    flex: 1,
    color: '#8c8c8c',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  actions: {
    marginTop: 37,
    marginHorizontal: 31,
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
