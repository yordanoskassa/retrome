import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import Svg, { Path } from 'react-native-svg';

const Login = () => {
  const emailRef = useRef("");
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
    // Trigger Animations
    logoOpacity.value = withTiming(1, { duration: 1800 });
    welcomeTextTranslateY.value = withSpring(0, {
      damping: 10,
      stiffness: 90,
    });
    formOpacity.value = withTiming(1, { duration: 1500, easing: Easing.out(Easing.ease) });
    footerOpacity.value = withTiming(1, { duration: 2700 });
  }, []);

  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  }

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login', "Please fill all the fields!");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert('Login', error.message);
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
          <Text style={styles.welcomeText}>Hey,</Text>
          <Text style={styles.welcomeText}>Welcome Back</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, formAnimatedStyle]}>
          <Text style={styles.smallText}>Please login to continue</Text>
          <Input
            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
            placeholder="Enter your email"
            placeholderTextColor={theme.colors.textLight}
            style={styles.input}
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
            secureTextEntry
            placeholder="Enter your password"
            placeholderTextColor={theme.colors.textLight}
            style={styles.input}
            onChangeText={(value) => (passwordRef.current = value)}
          />
          <Text style={styles.forgotPassword}>Forgot Password?</Text>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Apple Login Button */}
          <Pressable 
            style={styles.socialButton}
            onPress={() => Alert.alert('Coming Soon!', 'Apple login will be available soon.')}
          >
            <View style={styles.socialButtonContent}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M17.05 20.28c-.98.95-2.05.88-3.08.38-1.08-.52-2.07-.53-3.2 0-1.44.69-2.2.53-3.1-.38C3.7 16.33 4.76 9.89 9.02 9.56c1.37.07 2.4.91 3.23.93 1.21-.19 2.38-1.07 3.64-1.01 1.53.12 2.67.77 3.41 1.92-3.03 1.86-2.14 6.28 1.13 7.48-.68 1.45-1.39 2.92-3.38 4.4zM12.1 9.41c-.06-2.37 1.83-4.35 4.08-4.41.31 2.71-2.22 4.5-4.08 4.41z"
                  fill={theme.colors.text}
                />
              </Svg>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </View>
          </Pressable>

          {/* Button */}
          <Button title="Login" loading={loading} onPress={onSubmit} />
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, footerAnimatedStyle]}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => router.navigate('/signUp')}>
            <Text
              style={[
                styles.footerText,
                { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold },
              ]}
            >
              Sign up
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
    width: '100%',
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
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

  input: {
    color: theme.colors.text,

    alignSelf: 'left',
    textAlign: 'left',
    
    

  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2.5),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.gray,
  },
  dividerText: {
    color: theme.colors.textLight,
    paddingHorizontal: wp(4),
    fontSize: hp(1.6),
  },
  socialButton: {
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.sm,
    padding: hp(1.8),
    marginBottom: hp(1.5),
    width: '100%',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(3),
  },
  socialButtonText: {
    color: theme.colors.text,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
  },
});

export default Login;
