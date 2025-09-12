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
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer = __importStar(require("nodemailer"));
const crypto = __importStar(require("crypto"));
let EmailService = class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    generateResetCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    async sendVerificationEmail(email, token, name) {
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}&email=${email}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'STECH Pro 회원가입 인증',
            html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h1>🏈 STECH Pro</h1>
            <p>미식축구 전문 플랫폼에 오신 것을 환영합니다!</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
            <h2>안녕하세요, ${name || '사용자'}님!</h2>
            <p>STechPro 회원가입을 완료하려면 아래 버튼을 클릭해주세요.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;">
                이메일 인증하기
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              만약 버튼이 작동하지 않으면 아래 링크를 복사해서 브라우저에 붙여넣어주세요:<br>
              <a href="${verificationUrl}">${verificationUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              이 링크는 24시간 후에 만료됩니다.
            </p>
          </div>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`인증 이메일 발송 성공: ${email}`);
            return true;
        }
        catch (error) {
            console.error('이메일 발송 실패:', error);
            return false;
        }
    }
    async sendPasswordResetEmail(email, resetCode, username) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'STECH Pro 비밀번호 재설정',
            html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h1>🔐 STECH Pro</h1>
            <p>비밀번호 재설정 요청</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa; border-radius: 10px; margin-top: 20px;">
            <h2>안녕하세요, ${username || '사용자'}님!</h2>
            <p>비밀번호 재설정을 위한 인증코드입니다.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #667eea; color: white; padding: 20px; 
                          text-decoration: none; border-radius: 10px; font-weight: bold;
                          font-size: 24px; letter-spacing: 3px; display: inline-block;">
                ${resetCode}
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              이 인증코드를 비밀번호 재설정 페이지에 입력해주세요.
            </p>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              이 코드는 10분 후에 만료됩니다.
            </p>
            
            <p style="color: #ff6b6b; font-size: 14px; margin-top: 20px;">
              ⚠️ 본인이 요청하지 않으셨다면 이 이메일을 무시해주세요.
            </p>
          </div>
        </div>
      `,
        };
        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`패스워드 리셋 이메일 발송 성공: ${email}`);
            return true;
        }
        catch (error) {
            console.error('패스워드 리셋 이메일 발송 실패:', error);
            return false;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], EmailService);
//# sourceMappingURL=email.service.js.map