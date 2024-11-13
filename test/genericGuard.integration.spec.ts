import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  INestApplication,
  Injectable,
  CanActivate,
  Controller,
  Get,
} from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import * as request from 'supertest';
import { APP_GUARD } from '@nestjs/core';
import { TestModule } from '../src/testModule';

// @Injectable()
// class AlwaysFalseAuthGuard implements CanActivate {
//   canActivate(): boolean {
//     console.log('AlwaysFalseAuthGuard called');
//     return false;
//   }
// }

// @Resolver()
// class TestResolver {
//   @Query(() => String)
//   protectedQuery() {
//     return 'protected';
//   }
// }

// @Controller()
// class TestController {
//   @Get()
//   protectedQuery() {
//     return 'public';
//   }
// }

const PORT = 27850;

describe('AuthGuard Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    await app.listen(PORT);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 403 for a protected rest endpoint', async () => {
    await request(app.getHttpServer()).get('/').expect(403);
  });

  it('should return 403 for protected query (supertest)', async () => {
    const query = `
      query {
        protectedQuery
      }
    `;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(403); // Expect Unauthorized response
  });

  // eliminating supertest as the problem by testing with fetch
  it('should return 403 for protected query (fetch)', async () => {
    const payload = {
      operationName: null,
      variables: {},
      query: '{protectedQuery}',
    };

    await fetch(`http://localhost:${PORT}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).then((res) => {
      expect(res.status).toBe(403);
    });
  });
});
