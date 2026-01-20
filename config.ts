// Логика определения адреса Базы Данных (PocketBase)
const getPocketBaseUrl = () => {
  // Если мы открываем сайт в том же домене, где лежит API (например, через Localtunnel или pb_public),
  // то используем относительный путь. Это решает проблемы с CORS и HTTP/HTTPS.
  
  // Простое правило: если сайт запущен на localhost:5173 (Vite dev), то идем на порт 8090.
  // Во всех остальных случаях (включая туннели и production) идем в корень /.
  
  if (window.location.port === '5173') {
     return 'http://127.0.0.1:8090';
  }
  
  return '/';
};

export const config = {
  useMock: false, 
  pocketbaseUrl: getPocketBaseUrl(),
  apiUrl: 'http://localhost:3000/api' // Legacy field
};