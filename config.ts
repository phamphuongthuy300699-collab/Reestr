// Вставьте сюда вашу ссылку из терминала (localtunnel), чтобы Превью работало с локальной БД
// ВАЖНО: Ссылка меняется при каждом перезапуске localtunnel!
const TUNNEL_URL = 'https://yellow-teeth-shake.loca.lt';

// Логика определения URL сервера
const getPocketBaseUrl = () => {
  // 1. Если приложение открыто по самому туннелю (production build внутри PB)
  if (window.location.hostname.includes('loca.lt') || window.location.hostname.includes('ngrok')) {
    return '/'; 
  }

  // 2. Если мы разрабатываем в облаке (здесь, в чате), используем туннель до вашего ПК
  // Проверяем, что ссылка не пустая и мы не на localhost
  if (TUNNEL_URL && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return TUNNEL_URL;
  }

  // 3. Локальная разработка на вашем ПК (React на localhost:3000 -> PB на localhost:8090)
  return 'http://127.0.0.1:8090';
};

export const config = {
  // Флаг для переключения: true = Mock данные, false = PocketBase
  useMock: false, 
  
  // Адрес сервера вычисляется автоматически
  pocketbaseUrl: getPocketBaseUrl(),

  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
};