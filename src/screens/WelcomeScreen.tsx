import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import theme from '../theme';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView contentContainerStyle={styles.shell}>
        <View style={styles.branding}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>SS</Text>
          </View>
          <View>
            <Text style={styles.brandText}>Stadt Salzburg</Text>
            <Text style={styles.brandSubtext}>Smart citizen reporting</Text>
          </View>
        </View>

        <Text style={styles.headline}>Report a Problem Nearby</Text>
        <Text style={styles.subtitle}>Tell Stadt Salzburg where the issue happened, then speak or type your report.</Text>

        <View style={styles.panel}>
          <Text style={styles.heroTitle}>Contact and issue location</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First name</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="name@example.com"
            />
          </View>
          <View style={styles.inputGroupLast}>
            <Text style={styles.inputLabel}>Address where the issue occurred</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Street, building, or nearby landmark"
            />
          </View>
        </View>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate('Record', {
              firstName,
              lastName,
              email,
              address,
            })
          }
        >
          <Text style={styles.buttonText}>Continue to Voice or Text</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('AuthorityDashboard')}>
          <Text style={styles.secondaryButtonText}>City Authority Dashboard</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  shell: {
    padding: 20,
    paddingBottom: 36,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
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
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  brandSubtext: {
    color: theme.colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  headline: {
    fontSize: 34,
    fontWeight: '900',
    color: theme.colors.text,
    lineHeight: 42,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.muted,
    maxWidth: '90%',
    marginBottom: 20,
  },
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 2,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputGroupLast: {
    marginBottom: 0,
  },
  inputLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 7,
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
