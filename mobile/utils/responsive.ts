import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Breakpoints
export const isSmallDevice = width < 375;
export const isMediumDevice = width >= 375 && width < 414;
export const isLargeDevice = width >= 414;
export const isTablet = width >= 768;

// Responsive sizing
export const scale = (size: number): number => {
  const baseWidth = 375; // iPhone X width
  return (width / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
  const baseHeight = 812; // iPhone X height
  return (height / baseHeight) * size;
};

// Platform specific
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Safe area helpers
export const getSafeAreaPadding = () => {
  if (isIOS) {
    return { paddingTop: 44, paddingBottom: 34 };
  }
  return { paddingTop: 24, paddingBottom: 24 };
};



