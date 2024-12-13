import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import BackButton from '../components/BackButton';
import { useRouter } from 'expo-router';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import Icon from '../assets/icons';
import Input from '../components/Input';
import { useFonts } from 'expo-font';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const SignUp = () => {
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'retromefont': require('../assets/fonts/retromefont.ttf'),
    'cafedeparis': require('../assets/fonts/CafeDeParisSans.ttf'),
  });

  // Shared Values for Animations
  const logoOpacity = useSharedValue(0);
  const welcomeTextTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  // Animation Styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
  }));

  const welcomeTextStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: welcomeTextTranslateY.value }],
    opacity: 1 - welcomeTextTranslateY.value / 50,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const footerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  useEffect(() => {
    // Trigger Animations with slower transitions
    logoOpacity.value = withTiming(1, { duration: 2000 }); // Slow fade-in for the logo
    welcomeTextTranslateY.value = withSpring(0, {
      damping: 15,
      stiffness: 60,
    });
    formOpacity.value = withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) });
    footerOpacity.value = withTiming(1, { duration: 2000 }); // Slowest fade-in for the footer
  }, []);

  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  const onSubmit = async () => {
    if (!nameRef.current || !emailRef.current || !passwordRef.current) {
      Alert.alert('Sign up', "Please fill all the fields!");
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) Alert.alert('Sign up', error.message);
    setLoading(false);
  };

  return (
    <ScreenWrapper bg={'white'}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Back Button */}
        <View>
          <BackButton router={router} />
        </View>

        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <Text style={styles.logoText}>retrome</Text>
        </Animated.View>

        {/* Welcome Text */}
        <Animated.View style={welcomeTextStyle}>
          <Text style={styles.welcomeText}>Let's Get Started</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, formAnimatedStyle]}>
          <Text style={styles.smallText}>Please fill the details</Text>
          <Input
            icon={<Icon name="user" size={26} strokeWidth={1.6} />}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (nameRef.current = value)}
          />
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.textLight}
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <Button title="Sign up" loading={loading} onPress={onSubmit} />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimatedStyle]}>
          <Text style={styles.footerText}>Already have an account!</Text>
          <Pressable onPress={() => router.navigate('/login')}>
            <Text
              style={[
                styles.footerText,
                { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold },
              ]}
            >
              Login
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  logoContainer: {
    alignSelf: 'center',
  },
  logoText: {
    fontSize: hp(2.7),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    fontFamily: 'retromefont',
    alignSelf: 'center',
  },
  welcomeText: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    fontFamily: 'cafedeparis',
  },
  form: {
    gap: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: hp(3),
    fontFamily: 'cafedeparis',
  },
  smallText: {
    color: theme.colors.text,
    fontSize: hp(2.5),
    fontFamily: 'cafedeparis',
  },
});

export default SignUp;
