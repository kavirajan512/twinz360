import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();

  // Proxy /api to the FastAPI Python Backend running on port 8000
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }),
  );
  
  // Proxy /media to the FastAPI Python Backend running on port 8000
  app.use(
    '/media',
    createProxyMiddleware({
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
