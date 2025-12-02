import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../App';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

type SuccessRouteProp = RouteProp<MainStackParamList, 'Success'>;
type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'Success'>;

export default function SuccessScreen() {
  const route = useRoute<SuccessRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { issueId, createdAt } = route.params;

  const handleCopyLink = async () => {
    const link = `Issue #${issueId} - Submitted ${new Date(createdAt).toLocaleString()}`;
    await Clipboard.setStringAsync(link);
    Alert.alert('Copied', 'Link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync({
          message: `I reported an issue (#${issueId}) via Citizen Safety App. Submitted: ${new Date(createdAt).toLocaleString()}`,
        });
      } else {
        Alert.alert('Not Available', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>Report Submitted Successfully!</Text>
        <Text style={styles.subtitle}>Issue ID: #{issueId}</Text>
        <Text style={styles.date}>
          Submitted: {new Date(createdAt).toLocaleString()}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopyLink}>
            <Text style={styles.actionButtonText}>Copy Details</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.newReportButton}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'Issues' })}
        >
          <Text style={styles.newReportButtonText}>Report Another Issue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    fontSize: 64,
    color: '#16a34a',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  newReportButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#0ea5a4',
    borderRadius: 8,
    alignItems: 'center',
  },
  newReportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

