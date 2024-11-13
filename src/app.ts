import { TestModule } from './testModule';
import { NestFactory } from '@nestjs/core';

export const PORT = 23654;

export async function bootstrap() {
  const app = await NestFactory.create(TestModule);
  await app.init();
  await app.listen(PORT);
}
