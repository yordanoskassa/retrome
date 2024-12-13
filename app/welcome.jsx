import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { wp, hp } from '../helpers/common';
import { theme } from '../constants/theme';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';

const WelcomePage = () => {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    'retromefont': require('../assets/fonts/retromefont.ttf'),
    'cafedeparis': require('../assets/fonts/CafeDeParisSans.ttf'),
  });

  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  return (
    <ScreenWrapper bg={'white'}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Welcome Image */}
        <View style={styles.imageContainer}>
          {/* <Image 
            style={styles.welcomeImage} 
            resizeMode="contain" 
            source={require('../assets/images/retromelogo.png')} 
          /> */}
          <Text style={[styles.logoText, {fontFamily: 'retromefont'}]}>retrome</Text>
        </View>

        {/* Title and Punchline */}
        {/* <View style={styles.textContainer}>
          {/* <Text style={styles.title}>LinkUp!</Text>
          <Text style={styles.punchline}>
           The only streetwear app you'll ever need
          </Text>
        </View> */}

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable 
            style={styles.button} 
            onPress={() => router.push('signUp')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
          <View style={styles.bottomTextContainer}>
            <Text style={styles.loginText}>Already have an account?  </Text>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={[styles.loginText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
                Login
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: wp(5),
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(5),
  },
  welcomeImage: {
    height: hp(30),
    width: wp(50),
    marginBottom: hp(5),
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: hp(2),
    paddingHorizontal: wp(10),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(4),
    textAlign: 'center',
    fontWeight: theme.fonts.extraBold,
  },
  punchline: {
    textAlign: 'center',
    fontSize: hp(1.7),
    color: theme.colors.text,
    fontFamily: 'cafedeparis',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: hp(5),
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.5),
    width: wp(50),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0, // Sharp square corners
    elevation: 2, // Shadow for depth (optional)
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: hp(3),
    fontFamily: 'cafedeparis', // Custom font applied
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  loginText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(2.2),
    fontFamily: 'cafedeparis',

  },
  logoText: {
    color: theme.colors.primary,
    fontSize: hp(3),
    fontWeight: theme.fonts.extraBold,
    fontFamily: 'retromefont', // Custom font applied
    marginBottom: hp(7),
  },
});

export default WelcomePage;