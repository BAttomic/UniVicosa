/**
 * RootTabNavigator.jsx
 * -----------------------------------------------------------------------------
 * Navegador-raiz em abas do DamaLink. Compõe as duas features de topo:
 * "Câmbio" (pilha de cotações da AwesomeAPI) e "Jogo" (partida de damas 2D).
 * Os ícones vêm do conjunto Ionicons e seguem a paleta neon do app.
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import CheckersGameScreen from '../features/checkers/screens/CheckersGameScreen';
import palette from '../shared/theme/colors';
import dimensions from '../shared/theme/dimensions';
import ExchangeStackNavigator from './ExchangeStackNavigator';

const Tab = createBottomTabNavigator();

function RootTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.accent,
        tabBarInactiveTintColor: palette.muted,
        tabBarStyle: {
          backgroundColor: palette.primarySoft,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: dimensions.responsiveSize(70),
          paddingBottom: dimensions.spacing.sm,
          paddingTop: dimensions.spacing.sm,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Câmbio' ? 'cash-outline' : 'game-controller-outline';
          return <Ionicons name={iconName} color={color} size={size} />;
        },
        tabBarLabelStyle: {
          fontSize: dimensions.typography.sm,
          fontWeight: '700',
        },
      })}
    >
      <Tab.Screen
        name="Câmbio"
        component={ExchangeStackNavigator}
        options={{ tabBarLabel: 'Câmbio' }}
      />
      <Tab.Screen
        name="Jogo"
        component={CheckersGameScreen}
        options={{ tabBarLabel: 'Jogo' }}
      />
    </Tab.Navigator>
  );
}

export default RootTabNavigator;
