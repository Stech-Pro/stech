"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const express = __importStar(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://stech-1-0-iz4v.vercel.app',
            'http://3.34.47.22:3000',
            'http://www.stechpro.ai',
            'https://www.stechpro.ai',
            'http://stechpro.ai',
            'https://stechpro.ai',
            'http://stechpro-frontend.s3-website.ap-northeast-2.amazonaws.com',
            process.env.FRONTEND_URL,
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'Origin',
            'X-Requested-With',
            'Access-Control-Request-Method',
            'Access-Control-Request-Headers',
        ],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
    }));
    app.setGlobalPrefix('api');
    const config = new swagger_1.DocumentBuilder()
        .setTitle('🏈 STECH Pro API')
        .setDescription('미식축구 전문 플랫폼의 종합 스탯 분석 API\n\n' +
        '## 📋 주요 기능\n' +
        '- **선수 관리**: 선수 생성, 조회, 업데이트\n' +
        '- **포지션별 스탯 분석**: 10개 포지션 지원\n' +
        '- **클립 데이터 분석**: 자동 스탯 계산 및 저장\n' +
        '- **랭킹 시스템**: 포지션별, 스탯별 랭킹 조회\n' +
        '- **팀 관리**: 팀별 선수 관리\n\n' +
        '## 🎯 지원 포지션\n' +
        '1. **QB (쿼터백)** - 14개 스탯\n' +
        '2. **RB (러닝백)** - 22개 스탯\n' +
        '3. **WR (와이드 리시버)** - 22개 스탯 (리턴 포함)\n' +
        '4. **TE (타이트 엔드)** - 15개 스탯 (리턴 제외)\n' +
        '5. **Kicker** - 18개 스탯\n' +
        '6. **Punter** - 7개 스탯\n' +
        '7. **OL (오펜시브 라인맨)** - 4개 스탯\n' +
        '8. **DL (디펜시브 라인맨)** - 10개 스탯\n' +
        '9. **LB (라인백커)** - 10개 스탯\n' +
        '10. **DB (디펜시브 백)** - 10개 스탯\n\n' +
        '## 🔑 인증\n' +
        'Bearer Token을 사용한 JWT 인증이 필요한 일부 엔드포인트가 있습니다.')
        .setVersion('1.0.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰을 입력하세요',
    }, 'JWT-auth')
        .addTag('Auth', '인증 관련 API')
        .addTag('Player', '선수 관련 API')
        .addTag('Team', '팀 관련 API')
        .addTag('Video', '비디오 관련 API')
        .addServer('http://localhost:4000', '개발 서버')
        .addServer('http://52.79.100.123:4000', 'EC2 서버')
        .addServer('http://api.stechpro.ai:4000', 'API 도메인')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        customSiteTitle: 'STECH Pro API 문서',
        customfavIcon: '🏈',
        customCss: `
      .topbar-wrapper img {content:url('data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ctext y="18" font-size="18"%3E🏈%3C/text%3E%3C/svg%3E'); width:40px; height:auto;}
      .swagger-ui .topbar { background-color: #1f2937; }
      .swagger-ui .info .title { color: #f59e0b; }
    `,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
            docExpansion: 'none',
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
        },
    });
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`🚀 NestJS 서버가 http://localhost:${port}에서 실행 중입니다.`);
    console.log(`📚 Swagger 문서: http://localhost:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map