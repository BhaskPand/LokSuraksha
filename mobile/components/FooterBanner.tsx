import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

interface FooterBannerProps {
  imageSource?: any;
}

/**
 * FooterBanner - Thin footer area for banner/advertisement
 */
export default function FooterBanner({ imageSource }: FooterBannerProps) {
  return (
    <View style={styles.container}>
      {imageSource ? (
        <Image source={imageSource} style={styles.bannerImage} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          {/* Placeholder banner - can be replaced with actual image */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#f1f5f9',
    borderTopWidth: 1,
    borderTopColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '90%',
    height: 40,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
});

