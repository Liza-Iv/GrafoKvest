// Простой сервер для разработки
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Мок-API для тестирования
const mockApi = {
  '/api/auth/login': (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { email, password } = JSON.parse(body);

      // Имитация задержки сети
      setTimeout(() => {
        if (email === 'test@test.com' && password === '123456') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            user: { id: 1, name: 'Тест', email, role: 'PARENT' }
          }));
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            message: 'Неверный email или пароль',
            status: 401
          }));
        }
      }, 800);
    });
  },

  '/api/auth/register': (req, res) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      setTimeout(() => {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: { id: 2, name: 'Новый', email: 'new@test.com', role: 'PARENT' }
        }));
      }, 800);
    });
  }
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // Проверяем мок-API
  if (mockApi[req.url] && req.method === 'POST') {
    return mockApi[req.url](req, res);
  }

  // Статические файлы
  let filePath = path.join(__dirname,
    req.url === '/' ? 'index.html' : req.url
  );

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🌐 Фронтенд: http://localhost:${PORT}`);
  console.log('📝 Тестовый аккаунт: test@test.com / 123456');
  console.log('🛑 Ctrl+C для остановки');
});