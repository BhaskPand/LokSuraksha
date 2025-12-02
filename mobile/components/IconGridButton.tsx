import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
      activeOpacity={0.7}
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
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sosIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#991b1b', // Deeper muted red
    shadowColor: '#991b1b',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sosText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  label: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 4,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 2,
  },
  sosLabel: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 13,
  },
});

