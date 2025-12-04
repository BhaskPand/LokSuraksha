import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const { signup } = useAuth();

  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const inputScales = useRef({
    name: new Animated.Value(1),
    email: new Animated.Value(1),
    phone: new Animated.Value(1),
    password: new Animated.Value(1),
    confirmPassword: new Animated.Value(1),
  }).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const backgroundAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Background animation (continuous)
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundAnimation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: false,
        }),
        Animated.timing(backgroundAnimation, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Title animation
    Animated.parallel([
      Animated.spring(titleTranslateY, {
        toValue: 0,
        tension: 8,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Form animation
    Animated.parallel([
      Animated.spring(formTranslateY, {
        toValue: 0,
        tension: 8,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputFocus = (inputName: string) => {
    setFocusedInput(inputName);
    const scale = inputScales[inputName as keyof typeof inputScales];
    if (scale) {
      Animated.spring(scale, {
        toValue: 1.02,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleInputBlur = (inputName: string) => {
    setFocusedInput(null);
    const scale = inputScales[inputName as keyof typeof inputScales];
    if (scale) {
      Animated.spring(scale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const getInputIcon = (inputName: string) => {
    const icons: Record<string, { name: any; color: string }> = {
      name: { name: 'account-outline', color: focusedInput === 'name' ? '#8B5CF6' : '#94a3b8' },
      email: { name: 'email-outline', color: focusedInput === 'email' ? '#8B5CF6' : '#94a3b8' },
      phone: { name: 'phone-outline', color: focusedInput === 'phone' ? '#8B5CF6' : '#94a3b8' },
      password: { name: 'lock-outline', color: focusedInput === 'password' ? '#8B5CF6' : '#94a3b8' },
      confirmPassword: { name: 'lock-check-outline', color: focusedInput === 'confirmPassword' ? '#8B5CF6' : '#94a3b8' },
    };
    return icons[inputName] || { name: 'text-box-outline', color: '#94a3b8' };
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await signup(email.trim(), password, name.trim(), phone.trim() || undefined);
      
      if (result.requiresVerification) {
        // Navigate to email verification first
        navigation.navigate('EmailVerification', {
          email: result.email,
          phone: phone.trim() || undefined,
          dev_otps: result.dev_otps,
        });
      }
      // If verification not required (shouldn't happen), navigation handled by App.tsx
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const backgroundInterpolate = backgroundAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#F5F3FF', '#E9D5FF'],
  });

  const renderInput = (
    inputName: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    options: {
      keyboardType?: any;
      autoCapitalize?: any;
      secureTextEntry?: boolean;
      autoComplete?: any;
    } = {}
  ) => {
    const icon = getInputIcon(inputName);
    const scale = inputScales[inputName as keyof typeof inputScales];
    const isFocused = focusedInput === inputName;

    return (
      <Animated.View
        key={inputName}
        style={[
          styles.inputContainer,
          {
            transform: [{ scale: scale || 1 }],
          },
        ]}
      >
        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
          <MaterialCommunityIcons
            name={icon.name}
            size={20}
            color={icon.color}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            value={value}
            onChangeText={onChangeText}
            onFocus={() => handleInputFocus(inputName)}
            onBlur={() => handleInputBlur(inputName)}
            {...options}
          />
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[
          styles.background,
          {
            backgroundColor: backgroundInterpolate,
          },
        ]}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.header,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="account-plus" size={80} color="#8B5CF6" />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join LokSuraksha and stay safe</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.form,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            {renderInput('name', name, setName, 'Full Name', {
              autoCapitalize: 'words',
            })}

            {renderInput('email', email, setEmail, 'Email Address', {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              autoComplete: 'email',
            })}

            {renderInput('phone', phone, setPhone, 'Phone Number (Optional)', {
              keyboardType: 'phone-pad',
            })}

            {renderInput('password', password, setPassword, 'Password (min 6 characters)', {
              secureTextEntry: true,
              autoCapitalize: 'none',
            })}

            {renderInput('confirmPassword', confirmPassword, setConfirmPassword, 'Confirm Password', {
              secureTextEntry: true,
              autoCapitalize: 'none',
            })}

            <Animated.View
              style={{
                transform: [{ scale: buttonScale }],
              }}
            >
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignup}
                onPressIn={handleButtonPressIn}
                onPressOut={handleButtonPressOut}
                disabled={loading}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Create Account</Text>
                      <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" style={styles.buttonIcon} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>
                Already have an account?{' '}
                <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    minHeight: '100%',
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 16,
  },
  button: {
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 15,
    color: '#6B7280',
  },
  linkTextBold: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
});

