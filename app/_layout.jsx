import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Stack, useRouter, Tabs } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { getUserData } from '../services/userService'
import { LogBox } from 'react-native';
import Icon from '../assets/icons'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'

LogBox.ignoreLogs(['Warning: TNodeChildrenRenderer', 'Warning: MemoizedTNodeRenderer', 'Warning: TRenderEngineProvider']);

const _layout = () => {
  return (
    <AuthProvider>
        <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = ()=>{
    const {setAuth, setUserData, user} = useAuth();
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            setAuth(session?.user);
            updateUserData(session?.user);
            router.replace("/home");
        } else {
            setAuth(null);
            router.replace('/welcome')
        }
        })
    }, []);

    const updateUserData = async (user)=>{
        let res = await getUserData(user.id);
        if(res.success) setUserData(res.data);
    }

    return (
        <Stack 
            screenOptions={{
                headerShown: false,
            }}
        >
            {/* Main tab navigation */}
            <Stack.Screen 
                name="(tabs)" 
                options={{
                    headerShown: false,
                }} 
            />
            
            {/* Modal screens */}
            <Stack.Screen 
                name="(main)/postDetails" 
                options={{
                    presentation: 'modal',
                    headerShown: false,
                }}
            />
            
            {/* Auth screens */}
            <Stack.Screen 
                name="welcome" 
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    )
}

export default _layout