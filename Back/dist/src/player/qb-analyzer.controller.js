"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QbAnalyzerController = void 0;
const common_1 = require("@nestjs/common");
const qb_analyzer_service_1 = require("./qb-analyzer.service");
let QbAnalyzerController = class QbAnalyzerController {
    qbAnalyzerService;
    constructor(qbAnalyzerService) {
        this.qbAnalyzerService = qbAnalyzerService;
    }
    async analyzeQbData(gameData) {
        console.log('=== QB 분석 시작 ===');
        return await this.qbAnalyzerService.analyzeQbStats(gameData);
    }
};
exports.QbAnalyzerController = QbAnalyzerController;
__decorate([
    (0, common_1.Post)('analyze'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], QbAnalyzerController.prototype, "analyzeQbData", null);
exports.QbAnalyzerController = QbAnalyzerController = __decorate([
    (0, common_1.Controller)('qb'),
    __metadata("design:paramtypes", [qb_analyzer_service_1.QbAnalyzerService])
], QbAnalyzerController);
//# sourceMappingURL=qb-analyzer.controller.js.map