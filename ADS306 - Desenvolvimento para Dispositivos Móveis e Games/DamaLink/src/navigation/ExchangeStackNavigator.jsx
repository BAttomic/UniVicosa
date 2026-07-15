/**
 * ExchangeStackNavigator.jsx
 * -----------------------------------------------------------------------------
 * Pilha de navegação da feature "exchange": lista de cotações → detalhe do par.
 * Mantida separada do navegador-raiz para que a navegação interna do câmbio
 * evolua de forma independente da aba de jogo.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ExchangeListScreen from '../features/exchange/screens/ExchangeListScreen';
import ExchangeDetailScreen from '../features/exchange/screens/ExchangeDetailScreen';
import palette from '../shared/theme/colors';

const Stack = createNativeStackNavigator();

function ExchangeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: palette.surfaceMuted },
        headerStyle: {
          backgroundColor: palette.primary,
        },
        headerTintColor: palette.textLight,
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '800',
        },
      }}
    >
      <Stack.Screen
        name="ExchangeList"
        component={ExchangeListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExchangeDetail"
        component={ExchangeDetailScreen}
        options={{ title: 'Detalhes do câmbio' }}
      />
    </Stack.Navigator>
  );
}

export default ExchangeStackNavigator;
