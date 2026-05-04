import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { InvestmentScreen } from '../screens/dashboard/InvestmentScreen';
import { HistoryScreen } from '../screens/dashboard/HistoryScreen';
import { AuditScreen } from '../screens/dashboard/AuditScreen';
import { ProfileScreen } from '../screens/dashboard/ProfileScreen';
import { colors } from '../theme';

export type DashboardTabParamList = {
  Invest: undefined;
  History: undefined;
  Audit: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DashboardTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Invest:  { active: 'trending-up',          inactive: 'trending-up-outline' },
  History: { active: 'time',                 inactive: 'time-outline' },
  Audit:   { active: 'document-text',        inactive: 'document-text-outline' },
  Profile: { active: 'person-circle',        inactive: 'person-circle-outline' },
};

export const DashboardNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? icons.active : icons.inactive}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          height: Platform.OS === 'ios' ? 82 : 64,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 8 },
          }),
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
          fontSize: 17,
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Invest"  component={InvestmentScreen} options={{ title: 'Invest' }} />
      <Tab.Screen name="History" component={HistoryScreen}    options={{ title: 'History' }} />
      <Tab.Screen name="Audit"   component={AuditScreen}      options={{ title: 'Audit Log' }} />
      <Tab.Screen name="Profile" component={ProfileScreen}    options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};
