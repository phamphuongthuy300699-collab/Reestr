// Логика определения адреса Базы Данных (PocketBase)
const getPocketBaseUrl = () => {
  // 1. Продакшн (Файлы лежат внутри PocketBase в папке pb_public)
  // В этом случае сайт открывается с того же порта, что и API.
  // Мы возвращаем относительный путь, чтобы запросы шли на тот же хост.
  
  // Безопасная проверка: в некоторых средах (или при неправильной сборке) import.meta.env может быть undefined
  const meta = import.meta as any;
  const isProd = typeof meta.env !== 'undefined' && meta.env.PROD;

  if (isProd) {
    return '/';
  }

  // 2. Локальная разработка (Vite на 5173, PB на 8090)
  // Здесь мы жестко указываем адрес локального PB.
  return 'http://127.0.0.1:8090';
};

export const config = {
  useMock: false, 
  pocketbaseUrl: getPocketBaseUrl(),
  apiUrl: 'http://localhost:3000/api' // Legacy field
};