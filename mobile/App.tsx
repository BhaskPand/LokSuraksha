import { NavigationContainer, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { syncQueuedIssues } from './utils/syncQueue';
import { registerForPushNotifications, addNotificationReceivedListener, addNotificationResponseReceivedListener } from './utils/notifications';
import LoadingScreen from './components/LoadingScreen';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import PhoneVerificationScreen from './screens/PhoneVerificationScreen';
import HomeScreen from './screens/HomeScreen';
import ReportScreen from './screens/ReportScreen';
import ViewIssuesScreen from './screens/ViewIssuesScreen';
import IssueDetailScreen from './screens/IssueDetailScreen';
import EditIssueScreen from './screens/EditIssueScreen';
import SOSScreen from './screens/SOSScreen';
import ContactScreen from './screens/ContactScreen';
import WomenSafetyScreen from './screens/WomenSafetyScreen';
import SuccessScreen from './screens/SuccessScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import SettingsScreen from './screens/SettingsScreen';
import MenuScreen from './screens/MenuScreen';
import { Issue } from '@citizen-safety/shared';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  EmailVerification: { email: string; dev_otps?: { email_otp?: string; phone_otp?: string } };
  PhoneVerification: { email: string; phone: string; dev_otps?: { email_otp?: string; phone_otp?: string } };
};

// Main Stack
export type MainStackParamList = {
  MainTabs: undefined;
  Report: undefined;
  Success: { issueId: number; createdAt: string };
  ViewIssues: undefined;
  IssueDetail: { issueId: number };
  EditIssue: { issue: Issue };
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Settings: undefined;
};

// Tab Navigator
export type TabParamList = {
  Home: undefined;
  Issues: undefined;
  SOS: undefined;
  Contact: undefined;
  WomenSafety: undefined;
  Menu: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { colors, isDark } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 12,
          height: 72,
          borderRadius: 28,
          marginHorizontal: 16,
          marginBottom: 16,
          position: 'absolute',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Issues"
        component={ReportScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📋</Text>,
          tabBarLabel: 'Report',
        }}
      />
      <Tab.Screen
        name="SOS"
        component={SOSScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🚨</Text>,
        }}
      />
      <Tab.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📞</Text>,
        }}
      />
      <Tab.Screen
        name="WomenSafety"
        component={WomenSafetyScreen}
        options={{
          tabBarLabel: 'Women',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👩</Text>,
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>☰</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function MainNavigator() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <MainStack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Report"
        component={ReportScreen}
        options={{ title: 'Report Issue' }}
      />
      <MainStack.Screen
        name="Success"
        component={SuccessScreen}
        options={{ title: 'Report Submitted' }}
      />
        <MainStack.Screen
          name="ViewIssues"
          component={ViewIssuesScreen}
          options={{ title: 'My Issues' }}
        />
        <MainStack.Screen
          name="IssueDetail"
          component={IssueDetailScreen}
          options={{ title: 'Issue Details' }}
        />
        <MainStack.Screen
          name="EditIssue"
          component={EditIssueScreen}
          options={{ title: 'Edit Issue' }}
        />
        <MainStack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
        <MainStack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={{ title: 'Edit Profile' }}
        />
        <MainStack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{ title: 'Change Password' }}
        />
        <MainStack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </MainStack.Navigator>
    );
  }

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      <AuthStack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
    </AuthStack.Navigator>
  );
}

function AppContent() {
  const { isAuthenticated, loading, transitionLoading } = useAuth();

  // Register for push notifications
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications();
    }
  }, [isAuthenticated]);

  // Set up notification listeners
  useEffect(() => {
    const receivedListener = addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    const responseListener = addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;
      // Handle notification tap - navigate to issue detail if needed
      if (data?.issueId) {
        // Navigation will be handled by the listener
      }
    });

    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }, []);

  // Sync queued issues when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isAuthenticated) {
        syncQueuedIssues().then((result) => {
          if (result.success > 0) {
            console.log(`Synced ${result.success} queued issues`);
          }
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5a4" />
      </View>
    );
  }

  // Show beautiful loading screen during login/logout transitions
  if (transitionLoading) {
    return <LoadingScreen message={isAuthenticated ? 'Welcome back!' : 'Logging out...'} />;
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppWithNavigation />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppWithNavigation() {
  const { colors, isDark } = useTheme();
  
  const navTheme: NavTheme = {
    dark: isDark,
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppContent />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
