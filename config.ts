// Вставьте сюда вашу ссылку из терминала (localtunnel), если используете его
const TUNNEL_URL = ''; 

// Логика определения URL сервера
const getPocketBaseUrl = () => {
  // Если мы открыли сайт как статику из pb_public (порт 8090), 
  // то API находится по этому же адресу. Используем относительный путь.
  if (window.location.port === '8090') {
    return '/';
  }

  // Если используется туннель
  if (window.location.hostname.includes('loca.lt') || window.location.hostname.includes('ngrok')) {
    return '/'; 
  }

  // Если мы разрабатываем локально (React на 3000 порту, а PB на 8090)
  return 'http://127.0.0.1:8090';
};

export const config = {
  // Флаг для переключения: true = Mock данные, false = PocketBase
  useMock: false, 
  
  // Адрес сервера вычисляется автоматически
  pocketbaseUrl: getPocketBaseUrl(),

  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
};