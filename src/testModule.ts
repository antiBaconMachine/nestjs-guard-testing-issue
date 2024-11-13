import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import {
  Injectable,
  CanActivate,
  Controller,
  Get,
  Module,
} from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';

@Injectable()
export class AlwaysFalseAuthGuard implements CanActivate {
  canActivate(): boolean {
    console.log('AlwaysFalseAuthGuard called');
    return false;
  }
}

@Resolver()
export class TestResolver {
  @Query(() => String)
  protectedQuery() {
    return 'protected';
  }
}

@Controller()
export class TestController {
  @Get()
  protectedQuery() {
    return 'protected';
  }
}

@Module({
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
      provide: 'APP_GUARD',
      useClass: AlwaysFalseAuthGuard,
    },
  ],
})
export class TestModule {}
