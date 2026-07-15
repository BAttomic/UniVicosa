/**
 * RootTabNavigator.jsx
 * -----------------------------------------------------------------------------
 * Navegador-raiz da aplicação. Compõe as duas features de topo em abas:
 * "Clima" (pilha de telas de previsão) e "Xadrez" (partida contra a IA).
 * Os ícones das abas são desenhados em componentes locais para herdar a cor
 * ativa/inativa do React Navigation sem dependência de bibliotecas de ícones.
 */
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ChessGameScreen from '../features/chess/screens/ChessGameScreen';
import { theme } from '../shared/theme/theme';
import WeatherStackNavigator from './WeatherStackNavigator';

const Tab = createBottomTabNavigator();

// Ângulos dos raios do sol, distribuídos a cada 45°.
const SUN_RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** Ícone de sol desenhado em Views puras — herda a cor (ativo/inativo) da aba. */
function SunIcon({ color, size = 22 }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {SUN_RAY_ANGLES.map((angle) => (
        <View
          key={angle}
          style={{
            position: 'absolute',
            width: 2,
            height: size * 0.16,
            borderRadius: 1,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }, { translateY: -size * 0.44 }],
          }}
        />
      ))}
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: size * 0.25,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

/** Glifo clássico de rei do xadrez — também herda a cor da aba. */
function ChessKingIcon({ color, size = 22 }) {
  return <Text style={[styles.chessGlyph, { color, fontSize: size + 4 }]}>♚</Text>;
}

export default function RootTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.emerald,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarLabelStyle: {
          fontWeight: '700',
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.gold,
          borderTopWidth: 2,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Clima"
        component={WeatherStackNavigator}
        options={{
          tabBarIcon: ({ color }) => <SunIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Xadrez"
        component={ChessGameScreen}
        options={{
          tabBarIcon: ({ color }) => <ChessKingIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  chessGlyph: {
    lineHeight: 26,
  },
});
