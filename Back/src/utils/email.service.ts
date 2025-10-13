import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    console.log('📧 EmailService 초기화 중...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '설정됨' : '❌ 미설정');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '설정됨' : '❌ 미설정');
    
    // 환경변수 누락 시 에러 대신 경고 메시지
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  이메일 환경변수가 설정되지 않았습니다. 이메일 기능이 비활성화됩니다.');
      this.transporter = null;
      return;
    }

    // 이메일 전송 설정 (다음 메일 - 디버그 모드)
    console.log('🔐 다음 메일 SMTP 연결 시도:', process.env.EMAIL_USER);
    console.log('📧 앱 비밀번호 길이:', process.env.EMAIL_PASS?.length || 0);
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.daum.net',
      port: 465,
      secure: true, // SSL 사용
      auth: {
        user: process.env.EMAIL_USER, // 전체 이메일 주소
        pass: process.env.EMAIL_PASS, // 앱 비밀번호
      },
      debug: true,
      logger: true
    });
    
    console.log('✅ 이메일 transporter 설정 완료');
  }

  // 인증 토큰 생성
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // 6자리 인증코드 생성
  generateResetCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 인증 이메일 발송
  async sendVerificationEmail(
    email: string,
    token: string,
    name?: string,
  ): Promise<boolean> {
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
    } catch (error) {
      console.error('이메일 발송 실패:', error);
      return false;
    }
  }

  // 패스워드 리셋 이메일 발송
  async sendPasswordResetEmail(
    email: string,
    resetCode: string,
    username?: string,
  ): Promise<boolean> {
    console.log(`📧 패스워드 리셋 이메일 발송 시도: ${email}`);
    
    // transporter가 없으면 이메일 발송 불가
    if (!this.transporter) {
      console.error('❌ 이메일 transporter가 설정되지 않았습니다. 환경변수를 확인해주세요.');
      return false;
    }

    const mailOptions = {
      from: '"STECH Pro" <ethos614@stechpro.ai>',
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
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ 패스워드 리셋 이메일 발송 성공: ${email}`, result.messageId);
      return true;
    } catch (error) {
      console.error('❌ 패스워드 리셋 이메일 발송 실패:', error);
      console.error('에러 세부사항:', {
        code: error.code,
        response: error.response,
        message: error.message
      });
      return false;
    }
  }
}
