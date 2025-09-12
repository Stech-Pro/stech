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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const contact_service_1 = require("./contact.service");
let ContactController = class ContactController {
    contactService;
    constructor(contactService) {
        this.contactService = contactService;
    }
    async submitContact(body) {
        console.log('=== Contact API 호출됨 ===');
        console.log('받은 body:', body);
        console.log('body 타입:', typeof body);
        console.log('body keys:', Object.keys(body));
        try {
            const { fullName, email, reason, message } = body;
            if (!fullName || !email || !reason || !message) {
                console.log('유효성 검사 실패:', { fullName, email, reason, message });
                throw new common_1.HttpException('모든 필드를 입력해주세요.', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log('ContactService 호출 시작');
            const result = await this.contactService.processContact(body);
            console.log('ContactService 성공:', result);
            return {
                success: true,
                message: '문의가 성공적으로 접수되었습니다.',
                contactId: result.contactId,
            };
        }
        catch (error) {
            console.error('=== Contact Controller 에러 ===');
            console.error('에러:', error.message);
            throw new common_1.HttpException('문의 처리 중 오류가 발생했습니다.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "submitContact", null);
exports.ContactController = ContactController = __decorate([
    (0, common_1.Controller)('contact'),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map