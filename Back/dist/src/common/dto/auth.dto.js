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
exports.CreateProfileDto = exports.CheckUserExistsDto = exports.VerifyPasswordDto = exports.ResetPasswordDto = exports.SendResetCodeDto = exports.FindUserByEmailDto = exports.RefreshTokenDto = exports.VerifyTokenDto = exports.VerifyTeamCodeDto = exports.CheckUsernameDto = exports.LoginDto = exports.SignupDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SignupDto {
    username;
    password;
    authCode;
    teamName;
    role;
    region;
}
exports.SignupDto = SignupDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9]+$/, { message: '영어 및 숫자 조합만 입력해주세요.' }),
    __metadata("design:type", String)
], SignupDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: '비밀번호를 8글자 이상 입력해주세요.' }),
    __metadata("design:type", String)
], SignupDto.prototype, "password", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1802' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupDto.prototype, "authCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '건국대 레이징불스', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupDto.prototype, "teamName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'player', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '서울권', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SignupDto.prototype, "region", void 0);
class LoginDto {
    username;
    password;
}
exports.LoginDto = LoginDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'password123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], LoginDto.prototype, "password", void 0);
class CheckUsernameDto {
    username;
}
exports.CheckUsernameDto = CheckUsernameDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9]+$/, { message: '영어 및 숫자 조합만 입력해주세요.' }),
    __metadata("design:type", String)
], CheckUsernameDto.prototype, "username", void 0);
class VerifyTeamCodeDto {
    authCode;
}
exports.VerifyTeamCodeDto = VerifyTeamCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1802' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyTeamCodeDto.prototype, "authCode", void 0);
class VerifyTokenDto {
    token;
}
exports.VerifyTokenDto = VerifyTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: '검증할 JWT 토큰',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyTokenDto.prototype, "token", void 0);
class RefreshTokenDto {
    token;
}
exports.RefreshTokenDto = RefreshTokenDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: '갱신할 JWT 토큰',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RefreshTokenDto.prototype, "token", void 0);
class FindUserByEmailDto {
    email;
}
exports.FindUserByEmailDto = FindUserByEmailDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: '올바른 이메일 형식을 입력해주세요.' }),
    __metadata("design:type", String)
], FindUserByEmailDto.prototype, "email", void 0);
class SendResetCodeDto {
    email;
}
exports.SendResetCodeDto = SendResetCodeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: '올바른 이메일 형식을 입력해주세요.' }),
    __metadata("design:type", String)
], SendResetCodeDto.prototype, "email", void 0);
class ResetPasswordDto {
    email;
    resetCode;
    newPassword;
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com' }),
    (0, class_validator_1.IsEmail)({}, { message: '올바른 이메일 형식을 입력해주세요.' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123456' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{6}$/, { message: '6자리 숫자 코드를 입력해주세요.' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "resetCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'newpassword123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: '비밀번호를 8글자 이상 입력해주세요.' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
class VerifyPasswordDto {
    password;
}
exports.VerifyPasswordDto = VerifyPasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'currentpassword123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], VerifyPasswordDto.prototype, "password", void 0);
class CheckUserExistsDto {
    username;
}
exports.CheckUserExistsDto = CheckUserExistsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckUserExistsDto.prototype, "username", void 0);
class CreateProfileDto {
    realName;
    email;
    nationality;
    phone;
    address;
    height;
    weight;
    age;
    career;
    position;
    postalCode;
    playerID;
}
exports.CreateProfileDto = CreateProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '김건국', description: '성함' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "realName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: '이메일' }),
    (0, class_validator_1.IsEmail)({}, { message: '올바른 이메일 형식을 입력해주세요.' }),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '대한민국', description: '국적' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "nationality", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '010-1234-5678', description: '연락처' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '서울특별시 광진구 능동로 120', description: '주소' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 180, description: '키 (cm)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "height", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 75, description: '몸무게 (kg)' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 22, description: '나이' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProfileDto.prototype, "age", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2년', description: '경력' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "career", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'QB', description: '주포지션' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "position", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '05029', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "postalCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '건국이', description: '플레이어ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProfileDto.prototype, "playerID", void 0);
//# sourceMappingURL=auth.dto.js.map