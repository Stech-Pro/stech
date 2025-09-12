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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTeamDto = exports.CreateTeamDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateTeamDto {
    teamName;
    logoUrl;
}
exports.CreateTeamDto = CreateTeamDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Lions' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "teamName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/images/lions.png', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTeamDto.prototype, "logoUrl", void 0);
class UpdateTeamDto {
    teamName;
    logoUrl;
}
exports.UpdateTeamDto = UpdateTeamDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Updated Lions', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "teamName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '/images/new-logo.png', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateTeamDto.prototype, "logoUrl", void 0);
//# sourceMappingURL=team.dto.js.map