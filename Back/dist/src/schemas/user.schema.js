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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = __importStar(require("bcrypt"));
let User = class User {
    username;
    password;
    teamName;
    role;
    region;
    authCode;
    isActive;
    passwordResetCode;
    passwordResetExpires;
    passwordResetAttempts;
    memos;
    highlights;
    profile;
    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "teamName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['coach', 'player', 'admin'] }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "region", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "authCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", String)
], User.prototype, "passwordResetCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], User.prototype, "passwordResetExpires", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], User.prototype, "passwordResetAttempts", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                gameKey: String,
                clipKey: String,
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], User.prototype, "memos", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                gameKey: String,
                clipKey: String,
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], User.prototype, "highlights", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            avatar: String,
            bio: String,
            playerID: String,
            studentId: String,
            email: String,
            joinDate: { type: Date, default: Date.now },
            playerKey: String,
            realName: String,
            status: { type: String, enum: ['은퇴', '휴학', '재학', '진학'] },
            positions: {
                type: {
                    PS1: String,
                    PS2: String,
                    PS3: String,
                    PS4: String,
                    PS5: String,
                    PS6: String,
                    PS7: String,
                    PS8: String,
                    PS9: String,
                    PS10: String,
                },
                default: {},
                _id: false,
            },
            physicalInfo: {
                type: {
                    height: Number,
                    weight: Number,
                    age: Number,
                    grade: String,
                    nationality: String,
                },
                default: {},
                _id: false,
            },
            contactInfo: {
                type: {
                    postalCode: String,
                    address: String,
                    phone: String,
                    email: String,
                },
                default: {},
                _id: false,
            },
            career: String,
            totalStats: String,
            seasonStats: [String],
            gameStats: [String],
        },
        default: {},
        _id: false,
    }),
    __metadata("design:type", Object)
], User.prototype, "profile", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ collection: 'users', timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};
exports.UserSchema.index({ username: 1 });
exports.UserSchema.index({ teamName: 1, role: 1 });
//# sourceMappingURL=user.schema.js.map