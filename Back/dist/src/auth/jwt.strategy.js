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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const passport_jwt_1 = require("passport-jwt");
const user_schema_1 = require("../schemas/user.schema");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    userModel;
    constructor(userModel) {
        const secret = 'stech-super-secret-key-2025';
        console.log('JwtStrategy JWT_SECRET:', secret);
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.userModel = userModel;
    }
    async validate(payload) {
        console.log('JWT Payload:', payload);
        const user = await this.userModel.findById(payload.id);
        if (!user) {
            console.log('사용자를 찾을 수 없음:', payload.id);
            throw new common_1.UnauthorizedException();
        }
        console.log('JWT 검증 성공:', user.username);
        return {
            id: user._id,
            username: user.username,
            team: user.teamName,
            role: user.role,
            playerId: user.profile?.playerKey || null,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map