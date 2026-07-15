/**
 * exchangeApi.js
 * -----------------------------------------------------------------------------
 * Cliente HTTP (Axios) da feature "exchange", apontando para a AwesomeAPI de
 * câmbio. Centraliza baseURL, timeout e o interceptor que traduz falhas de rede
 * e códigos de status em mensagens de erro amigáveis consumidas pelos hooks.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://economia.awesomeapi.com.br/json',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(normalizeError('Tempo limite excedido. Verifique sua conexão.'));
    }

    if (!error.response) {
      return Promise.reject(normalizeError('Sem conexão com a internet. Verifique sua rede.'));
    }

    const status = error.response.status;

    if (status === 404) {
      return Promise.reject(normalizeError('Cotação não encontrada.', status));
    }

    if (status >= 500) {
      return Promise.reject(normalizeError('Erro no serviço de câmbio. Tente novamente.', status));
    }

    return Promise.reject(normalizeError('Não foi possível concluir a consulta de câmbio.', status));
  }
);

function normalizeError(message, status) {
  const normalizedError = new Error(message);
  if (status) {
    normalizedError.status = status;
  }
  return normalizedError;
}

function getApiErrorMessage(error, fallbackMessage = 'Não foi possível carregar as cotações. Tente novamente.') {
  if (!error) {
    return fallbackMessage;
  }

  return error.message || fallbackMessage;
}

export { api, getApiErrorMessage };
export default api;
