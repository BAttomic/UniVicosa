/**
 * weatherApi.js
 * -----------------------------------------------------------------------------
 * Camada de acesso à API de clima da feature "weather". Usa a OpenWeatherMap
 * quando há chave configurada e, caso contrário, recorre de forma transparente
 * ao Open-Meteo (sem chave) para um conjunto fixo de capitais brasileiras.
 * Expõe `fetchWeatherList` e `fetchWeatherDetail` já normalizando as respostas
 * para o formato consumido pelas telas.
 */
import axios from 'axios';

// Substitua pela sua OpenWeatherMap API key real, obtida gratuitamente em https://openweathermap.org/api.
const OPEN_WEATHER_API_KEY = 'COLOQUE_SUA_KEY_AQUI';

const OPEN_METEO_CITY_COORDS = {
  'São Paulo': { latitude: -23.5505, longitude: -46.6333, country: 'BR' },
  'Rio de Janeiro': { latitude: -22.9068, longitude: -43.1729, country: 'BR' },
  'Belo Horizonte': { latitude: -19.9167, longitude: -43.9345, country: 'BR' },
  Curitiba: { latitude: -25.4284, longitude: -49.2733, country: 'BR' },
  Salvador: { latitude: -12.9777, longitude: -38.5016, country: 'BR' },
  Brasília: { latitude: -15.7939, longitude: -47.8828, country: 'BR' },
  Fortaleza: { latitude: -3.7319, longitude: -38.5267, country: 'BR' },
  Recife: { latitude: -8.0476, longitude: -34.877, country: 'BR' },
  'Porto Alegre': { latitude: -30.0346, longitude: -51.2177, country: 'BR' },
  Manaus: { latitude: -3.119, longitude: -60.0217, country: 'BR' },
};

const weatherClient = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 10000,
});

const fallbackWeatherClient = axios.create({
  baseURL: 'https://api.open-meteo.com/v1',
  timeout: 10000,
});

function isOpenWeatherKeyMissing() {
  return !OPEN_WEATHER_API_KEY || OPEN_WEATHER_API_KEY === 'COLOQUE_SUA_KEY_AQUI';
}

function weatherCodeToDescription(weatherCode) {
  const map = {
    0: 'ceu limpo',
    1: 'poucas nuvens',
    2: 'parcialmente nublado',
    3: 'nublado',
    45: 'nevoeiro',
    48: 'nevoeiro gelado',
    51: 'garoa leve',
    53: 'garoa moderada',
    55: 'garoa forte',
    61: 'chuva leve',
    63: 'chuva moderada',
    65: 'chuva forte',
    71: 'neve leve',
    73: 'neve moderada',
    75: 'neve forte',
    80: 'pancadas de chuva leves',
    81: 'pancadas de chuva moderadas',
    82: 'pancadas de chuva fortes',
    95: 'trovoadas',
    96: 'trovoadas com granizo',
    99: 'trovoadas severas com granizo',
  };

  return map[weatherCode] ?? 'tempo variavel';
}

function weatherCodeToIcon(weatherCode) {
  if (weatherCode === 0) return '01d';
  if ([1, 2].includes(weatherCode)) return '02d';
  if ([3, 45, 48].includes(weatherCode)) return '03d';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) return '10d';
  if ([71, 73, 75].includes(weatherCode)) return '13d';
  if ([95, 96, 99].includes(weatherCode)) return '11d';
  return '03d';
}

async function fetchOpenMeteoWeather(cityName) {
  const coords = OPEN_METEO_CITY_COORDS[cityName];

  if (!coords) {
    throw new Error(`Cidade "${cityName}" não está no fallback de clima.`);
  }

  const response = await fallbackWeatherClient.get('/forecast', {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: 'auto',
      current: 'temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code',
      daily: 'temperature_2m_min,temperature_2m_max',
    },
  });

  const current = response.data?.current;
  const daily = response.data?.daily;

  if (!current) {
    throw new Error('Resposta inválida da API de fallback de clima.');
  }

  const weatherCode = current.weather_code;

  return {
    name: cityName,
    country: coords.country,
    temp: Math.round(current.temperature_2m),
    temp_min: Math.round(daily?.temperature_2m_min?.[0] ?? current.temperature_2m),
    temp_max: Math.round(daily?.temperature_2m_max?.[0] ?? current.temperature_2m),
    feels_like: Math.round(current.apparent_temperature),
    humidity: Math.round(current.relative_humidity_2m),
    pressure: Math.round(current.surface_pressure),
    wind_speed: Math.round(current.wind_speed_10m),
    description: weatherCodeToDescription(weatherCode),
    icon: weatherCodeToIcon(weatherCode),
  };
}

/**
 * Normaliza a resposta do clima para a lista principal.
 * @param {object} responseData
 * @param {number} id
 * @param {string} name
 * @returns {object}
 */
function normalizeWeatherListItem(responseData, id, name) {
  return {
    id,
    name,
    temp: Math.round(responseData.main.temp),
    description: responseData.weather?.[0]?.description ?? 'Sem descrição',
    humidity: responseData.main.humidity,
    icon: responseData.weather?.[0]?.icon ?? '01d',
    country: responseData.sys?.country ?? '',
  };
}

/**
 * Normaliza a resposta do clima detalhado.
 * @param {object} responseData
 * @returns {object}
 */
function normalizeWeatherDetail(responseData) {
  return {
    name: responseData.name,
    country: responseData.sys?.country ?? '',
    temp: Math.round(responseData.main.temp),
    temp_min: Math.round(responseData.main.temp_min),
    temp_max: Math.round(responseData.main.temp_max),
    feels_like: Math.round(responseData.main.feels_like),
    humidity: responseData.main.humidity,
    pressure: responseData.main.pressure,
    wind_speed: responseData.wind?.speed ?? 0,
    description: responseData.weather?.[0]?.description ?? 'Sem descrição',
    icon: responseData.weather?.[0]?.icon ?? '01d',
  };
}

/**
 * Busca o clima de várias cidades em paralelo.
 * @param {Array<string>} cities
 * @returns {Promise<Array<object>>}
 */
export async function fetchWeatherList(cities) {
  try {
    if (isOpenWeatherKeyMissing()) {
      const fallbackResults = await Promise.allSettled(cities.map((city) => fetchOpenMeteoWeather(city)));
      const fallbackSuccess = fallbackResults
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'fulfilled')
        .map(({ result, index }) =>
          normalizeWeatherListItem(
            {
              name: result.value.name,
              main: { temp: result.value.temp, humidity: result.value.humidity },
              weather: [{ description: result.value.description, icon: result.value.icon }],
              sys: { country: result.value.country },
            },
            index,
            cities[index]
          )
        );

      if (fallbackSuccess.length === 0) {
        throw new Error('Falha ao carregar os dados de clima (fallback).');
      }

      return fallbackSuccess;
    }

    const settledResults = await Promise.allSettled(
      cities.map((city) =>
        weatherClient.get('/weather', {
          params: {
            q: city,
            units: 'metric',
            lang: 'pt_br',
            appid: OPEN_WEATHER_API_KEY,
          },
        })
      )
    );

    const successfulResults = settledResults
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === 'fulfilled')
      .map(({ result, index }) => normalizeWeatherListItem(result.value.data, index, cities[index]));

    if (successfulResults.length === 0) {
      const firstRejected = settledResults.find((result) => result.status === 'rejected');
      if (firstRejected?.reason?.response?.status === 401) {
        throw new Error('Chave da OpenWeatherMap inválida. Substitua COLOQUE_SUA_KEY_AQUI.');
      }

      throw new Error('Não foi possível carregar o clima de nenhuma cidade.');
    }

    return successfulResults;
  } catch (error) {
    if (error.response?.status === 401) {
      if (isOpenWeatherKeyMissing()) {
        throw new Error('Configure sua chave da OpenWeatherMap para resultados ao vivo em tempo real.');
      }

      throw new Error('Chave da OpenWeatherMap inválida. Substitua COLOQUE_SUA_KEY_AQUI.');
    }

    if (error.message?.includes('fallback')) {
      throw new Error('Falha ao carregar os dados de clima. Verifique conexão e tente novamente.');
    }

    throw new Error('Falha ao carregar os dados de clima. Verifique sua conexão ou configure sua chave da OpenWeatherMap.');
  }
}

/**
 * Busca o clima detalhado de uma cidade.
 * @param {string} cityName
 * @returns {Promise<object>}
 */
export async function fetchWeatherDetail(cityName) {
  try {
    if (isOpenWeatherKeyMissing()) {
      return await fetchOpenMeteoWeather(cityName);
    }

    const response = await weatherClient.get('/weather', {
      params: {
        q: cityName,
        units: 'metric',
        lang: 'pt_br',
        appid: OPEN_WEATHER_API_KEY,
      },
    });

    return normalizeWeatherDetail(response.data);
  } catch (error) {
    if (error.response?.status === 401 && isOpenWeatherKeyMissing()) {
      return await fetchOpenMeteoWeather(cityName);
    }

    if (error.response?.status === 404) {
      throw new Error(`Cidade "${cityName}" não encontrada.`);
    }

    throw new Error('Não foi possível carregar o detalhamento do clima. Verifique conexão ou API key.');
  }
}