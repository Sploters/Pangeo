import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Colors } from '../theme';
import { Icons } from '../components';
import { useProfileStore } from '../store';

import HomeScreen from '../screens/HomeScreen';
import SRSScreen from '../screens/SRSScreen';
import CaptureScreen from '../screens/CaptureScreen';
import VaultScreen from '../screens/VaultScreen';
import ContentScreen from '../screens/ContentScreen';
import ShadowingScreen from '../screens/ShadowingScreen';
import PronunciationScreen from '../screens/PronunciationScreen';
import ZipfScreen from '../screens/ZipfScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

import { VocabSuggestion } from '../data/seed';
import TriagemScreen       from '../screens/TriagemScreen';
import NewsListScreen      from '../screens/NewsListScreen';
import NewsArticleScreen   from '../screens/NewsArticleScreen';
import ContentDetailScreen from '../screens/ContentDetailScreen';

export type RootStackParamList = {
  Main: undefined;
  Shadowing: undefined;
  SRS: undefined;
  Capture: undefined;
  Pronunciation: undefined;
  Zipf: undefined;
  Profile: undefined;
  Onboarding: undefined;
  Triagem: { suggestions: VocabSuggestion[]; title: string; subtitle: string };
  NewsList: undefined;
  NewsArticle: { articleId: string };
  ContentDetail: { contentId: string };
};

export type TabParamList = {
  Home: undefined;
  Vault: undefined;
  Discover: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabBar({ state, navigation: nav }: any) {
  const tabs = [
    { key: 'Home', label: 'Home', Icon: Icons.Home },
    { key: 'SRS', label: 'Revisão', Icon: Icons.Stack, isStack: true },
    { key: 'Capture', label: 'Capturar', Icon: Icons.Plus, isCenter: true },
    { key: 'Vault', label: 'Vault', Icon: Icons.Vault },
    { key: 'Discover', label: 'Descobrir', Icon: Icons.Compass },
  ];
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: Colors.paper,
      borderTopWidth: 0.5,
      borderTopColor: Colors.line,
      paddingBottom: 24,
      paddingTop: 10,
      alignItems: 'center',
    }}>
      {tabs.map((tab, index) => {
        const tabIdx = ['Home', 'Vault', 'Discover'].indexOf(tab.key);
        const focused = tabIdx >= 0 && state.index === tabIdx;
        const color = focused ? Colors.moss : Colors.inkMute;
        if (tab.isCenter) {
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => nav.navigate('Capture')}
              style={{
                flex: 1, alignItems: 'center',
                marginTop: -20,
              }}
              activeOpacity={0.85}
            >
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: Colors.moss,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: Colors.moss, shadowOpacity: 0.35,
                shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
                elevation: 6,
              }}>
                <tab.Icon size={22} color={Colors.sand} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.inkMute, marginTop: 3 }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }
        if (tab.isStack) {
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => nav.navigate('SRS')}
              style={{ flex: 1, alignItems: 'center', gap: 4 }}
              activeOpacity={0.7}
            >
              <tab.Icon size={22} color={Colors.inkMute} />
              <Text style={{ fontSize: 10, fontWeight: '600', color: Colors.inkMute }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => nav.navigate(tab.key)}
            style={{ flex: 1, alignItems: 'center', gap: 4 }}
            activeOpacity={0.7}
          >
            <tab.Icon size={22} color={color} />
            <Text style={{ fontSize: 10, fontWeight: '600', color }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Discover" component={ContentScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const onboarded = useProfileStore((s) => s.onboarded);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={onboarded ? 'Main' : 'Onboarding'}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Shadowing" component={ShadowingScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="SRS" component={SRSScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Capture" component={CaptureScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="Pronunciation" component={PronunciationScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Zipf" component={ZipfScreen} options={{ presentation: 'modal' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Triagem"       component={TriagemScreen}       options={{ presentation: 'modal' }} />
        <Stack.Screen name="NewsList"      component={NewsListScreen}      options={{ presentation: 'modal' }} />
        <Stack.Screen name="NewsArticle"   component={NewsArticleScreen}   />
        <Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
