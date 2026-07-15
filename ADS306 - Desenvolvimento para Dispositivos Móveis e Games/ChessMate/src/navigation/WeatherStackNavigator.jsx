/**
 * WeatherStackNavigator.jsx
 * -----------------------------------------------------------------------------
 * Pilha de navegação da feature "weather": lista de cidades → detalhe da cidade.
 * Isolada em seu próprio arquivo para manter o navegador-raiz enxuto e permitir
 * que cada feature evolua sua navegação interna de forma independente.
 */
import { createStackNavigator } from '@react-navigation/stack';

import WeatherDetailScreen from '../features/weather/screens/WeatherDetailScreen';
import WeatherListScreen from '../features/weather/screens/WeatherListScreen';

const Stack = createStackNavigator();

export default function WeatherStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WeatherList" component={WeatherListScreen} />
      <Stack.Screen name="WeatherDetail" component={WeatherDetailScreen} />
    </Stack.Navigator>
  );
}
