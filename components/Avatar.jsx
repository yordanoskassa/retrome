import { StyleSheet } from 'react-native';
import React from 'react';
import { hp } from '../helpers/common';
import { theme } from '../constants/theme';
import { getUserImageSrc } from '../services/imageService';
import { Image } from 'expo-image';

const Avatar = ({
  uri, 
  size = hp(4.5), // Default size
  rounded = 'circle', // Default to circle for rounded avatars
  style = {}
}) => {
  const borderRadius = rounded === 'circle' ? size / 2 : rounded;

  return (
    <Image 
      source={getUserImageSrc(uri)} 
      transition={100}
      style={[
        styles.avatar, 
        { height: size, width: size, borderRadius }, 
        style
      ]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderColor: theme.colors.darkLight,
    borderWidth: 0,
    overflow: 'hidden', // Ensures content stays within the bounds
  },
});

export default Avatar;
