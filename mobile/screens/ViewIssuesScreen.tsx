import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Issue, IssueFilters, IssuePriority } from '@citizen-safety/shared';
import IssueSearchFilter from '../components/IssueSearchFilter';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<MainStackParamList, 'ViewIssues'>;

const statusColors: Record<string, string> = {
  open: '#2563eb',
  in_progress: '#ca8a04',
  resolved: '#16a34a',
};

const statusLabels: Record<string, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

const priorityColors: Record<IssuePriority, string> = {
  critical: '#DC2626',
  high: '#F59E0B',
  medium: '#3B82F6',
  low: '#10B981',
};

const priorityLabels: Record<IssuePriority, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function ViewIssuesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<IssueFilters>({ userId: user?.id });

  const handleIssuePress = (issue: Issue) => {
    (navigation as any).navigate('IssueDetail', { issueId: issue.id });
  };

  const fetchIssues = async () => {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:3001';
      const token = await AsyncStorage.getItem('auth_token');
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('userId', user.id.toString());
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      
      const response = await fetch(`${apiBaseUrl}/api/issues?${queryParams.toString()}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      setIssues([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      setFilters({ ...filters, userId: user.id });
    }
  }, [user]);

  useEffect(() => {
    fetchIssues();
  }, [filters, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5a4" />
        <Text style={styles.loadingText}>Loading your issues...</Text>
      </View>
    );
  }

  const categories = Array.from(new Set(issues.map(i => i.category)));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Reported Issues</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {issues.length} issue{issues.length !== 1 ? 's' : ''} reported
        </Text>
      </View>

      <IssueSearchFilter
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {issues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Issues Found</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {filters.search || filters.status || filters.priority
                ? 'Try adjusting your filters'
                : "You haven't reported any issues yet."}
            </Text>
            {!filters.search && !filters.status && !filters.priority && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Tap "Report Issue" to get started!
              </Text>
            )}
          </View>
        ) : (
          issues.map((issue) => (
            <TouchableOpacity
              key={issue.id}
              style={[styles.issueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleIssuePress(issue)}
              activeOpacity={0.7}
            >
              <View style={styles.issueHeader}>
                <View style={styles.issueHeaderLeft}>
                  <Text style={[styles.issueTitle, { color: colors.text }]}>{issue.title}</Text>
                  <View style={styles.badgesRow}>
                    <Text style={[styles.issueCategory, { color: colors.primary }]}>
                      {issue.category}
                    </Text>
                    {issue.priority && (
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: priorityColors[issue.priority] },
                        ]}
                      >
                        <Text style={styles.priorityText}>
                          {priorityLabels[issue.priority]}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColors[issue.status] || '#64748b' },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {statusLabels[issue.status] || issue.status}
                  </Text>
                </View>
              </View>

              <Text style={[styles.issueDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {issue.description}
              </Text>

              <View style={styles.issueFooter}>
                <Text style={[styles.issueDate, { color: colors.textSecondary }]}>
                  {new Date(issue.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                {issue.images && issue.images.length > 0 && (
                  <View style={styles.imageBadge}>
                    <Text style={[styles.imageBadgeText, { color: colors.textSecondary }]}>
                      📷 {issue.images.length}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    minHeight: 400,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  issueCard: {
    margin: 16,
    marginBottom: 0,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  issueHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  issueCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  issueDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueDate: {
    fontSize: 12,
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageBadgeText: {
    fontSize: 12,
  },
});

