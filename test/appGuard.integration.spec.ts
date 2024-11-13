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

@Injectable()
class AlwaysFalseAuthGuard implements CanActivate {
  canActivate(): boolean {
    console.log('AlwaysFalseAuthGuard called');
    return false;
  }
}

@Resolver()
class TestResolver {
  @Query(() => String)
  protectedQuery() {
    return 'you should not see this';
  }
}

@Controller()
class TestController {
  @Get()
  protectedQuery() {
    return 'you should not see this';
  }
}

const PORT = 27860;

describe('Application AuthGuard Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          autoSchemaFile: true,
        }),
      ],
      controllers: [TestController],
      providers: [
        TestResolver,
        {
          provide: APP_GUARD,
          useClass: AlwaysFalseAuthGuard,
        },
      ],
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

  it('should return error for protected query', async () => {
    const query = `
      query {
        protectedQuery
      }
    `;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200) // Because it's graphql, it will return 200, but with an error
      .expect((res) => {
        console.log(res.body);
        expect(res.body.errors).toBeDefined();
      });
  });
});
