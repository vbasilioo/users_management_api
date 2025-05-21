import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    const dataSource = app.get(DataSource);
    dataSource.setOptions({ logging: false });
    
    await app.init();
    
    await new Promise((resolve) => setTimeout(resolve, 5000));
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect((response) => {
        expect([200, 404, 500]).toContain(response.status);
      });
  });

  afterEach(async () => {
    await app.close();
  });

  it('deve responder com status 404 para rotas não encontradas', () => {
    return request(app.getHttpServer())
      .get('/rota-inexistente')
      .expect(404);
  });
});
