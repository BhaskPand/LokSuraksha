import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

interface IconGridButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  isSOS?: boolean;
  accessibilityLabel?: string;
}

/**
 * IconGridButton - Reusable circular icon button for the grid layout
 */
export default function IconGridButton({
  icon,
  label,
  onPress,
  isSOS = false,
  accessibilityLabel,
}: IconGridButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isSOS && styles.sosContainer]}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel || label}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={[styles.iconCircle, isSOS && styles.sosIconCircle]}>
        {isSOS ? (
          <Text style={styles.sosText}>SOS</Text>
        ) : (
          <MaterialCommunityIcons
            name={icon as any}
            size={32}
            color={isSOS ? '#fff' : '#475569'}
          />
        )}
      </View>
      <Text style={[styles.label, isSOS && styles.sosLabel]} numberOfLines={2}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  sosContainer: {
    // SOS button is slightly larger
  },
  iconCircle: {
    width: isSmallDevice ? 68 : 76,
    height: isSmallDevice ? 68 : 76,
    borderRadius: isSmallDevice ? 34 : 38,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  sosIconCircle: {
    width: isSmallDevice ? 86 : 96,
    height: isSmallDevice ? 86 : 96,
    borderRadius: isSmallDevice ? 43 : 48,
    backgroundColor: '#991b1b', // Deeper muted red
    shadowColor: '#991b1b',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  sosText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  label: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 4,
    fontWeight: '500',
    lineHeight: isSmallDevice ? 14 : 16,
    marginTop: 2,
  },
  sosLabel: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: isSmallDevice ? 12 : 13,
  },
});

