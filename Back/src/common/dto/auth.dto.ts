import {
  IsString,
  MinLength,
  IsOptional,
  Matches,
  IsEmail,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, { message: '영어 및 숫자 조합만 입력해주세요.' })
  username: string; // 아이디 (기존 email → username)

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8, { message: '비밀번호를 8글자 이상 입력해주세요.' })
  password: string;

  @ApiProperty({ example: '1802' })
  @IsString()
  authCode: string; // 인증코드

  @ApiProperty({ example: '건국대 레이징불스', required: false })
  @IsOptional()
  @IsString()
  teamName?: string; // 팀명 (인증코드로 자동 설정)

  @ApiProperty({ example: 'player', required: false })
  @IsOptional()
  @IsString()
  role?: string; // 역할 (인증코드로 자동 설정)

  @ApiProperty({ example: '서울권', required: false })
  @IsOptional()
  @IsString()
  region?: string; // 지역 (인증코드로 자동 설정)
}

export class LoginDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  username: string; // 아이디 (기존 email → username)

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class CheckUsernameDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  @Matches(/^[a-zA-Z0-9]+$/, { message: '영어 및 숫자 조합만 입력해주세요.' })
  username: string;
}

export class VerifyTeamCodeDto {
  @ApiProperty({ example: '1802' })
  @IsString()
  authCode: string;
}

export class VerifyTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '검증할 JWT 토큰',
  })
  @IsString()
  token: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: '갱신할 JWT 토큰',
  })
  @IsString()
  token: string;
}

export class FindUserByEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;
}

export class SendResetCodeDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: '6자리 숫자 코드를 입력해주세요.' })
  resetCode: string;

  @ApiProperty({ example: 'newpassword123' })
  @IsString()
  @MinLength(8, { message: '비밀번호를 8글자 이상 입력해주세요.' })
  newPassword: string;
}

export class VerifyPasswordDto {
  @ApiProperty({ example: 'currentpassword123' })
  @IsString()
  password: string;
}

export class CheckUserExistsDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  username: string;
}

export class CreateProfileDto {
  @ApiProperty({ example: '김건국', description: '성함' })
  @IsString()
  realName: string;

  @ApiProperty({ example: 'user@example.com', description: '이메일' })
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email: string;

  @ApiProperty({ example: '대한민국', description: '국적' })
  @IsString()
  nationality: string;

  @ApiProperty({ example: '010-1234-5678', description: '연락처' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '서울특별시 광진구 능동로 120', description: '주소' })
  @IsString()
  address: string;

  @ApiProperty({ example: 180, description: '키 (cm)' })
  @IsNumber()
  height: number;

  @ApiProperty({ example: 75, description: '몸무게 (kg)' })
  @IsNumber()
  weight: number;

  @ApiProperty({ example: 22, description: '나이' })
  @IsNumber()
  age: number;

  @ApiProperty({ example: '2년', description: '경력' })
  @IsString()
  career: string;

  @ApiProperty({ example: 'QB', description: '주포지션' })
  @IsString()
  position: string;

  @ApiProperty({ example: '05029', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: '건국이', description: '플레이어ID' })
  @IsOptional()
  @IsString()
  playerID?: string;
}

export class UpdateProfileDto {
  @ApiProperty({ example: '김건국', description: '성함', required: false })
  @IsOptional()
  @IsString()
  realName?: string;

  @ApiProperty({
    example: '건국이',
    description: '플레이어ID/유저네임',
    required: false,
  })
  @IsOptional()
  @IsString()
  playerID?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: '이메일',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '올바른 이메일 형식을 입력해주세요.' })
  email?: string;

  @ApiProperty({ example: '대한민국', description: '국적', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({
    example: '010-1234-5678',
    description: '연락처',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '서울특별시 광진구 능동로 120',
    description: '주소',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '05029', description: '우편번호', required: false })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ example: 180, description: '키 (cm)', required: false })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiProperty({ example: 75, description: '몸무게 (kg)', required: false })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: 22, description: '나이', required: false })
  @IsOptional()
  @IsNumber()
  age?: number;

  @ApiProperty({
    example: '고등학교 3년, 대학교 2년',
    description: '경력',
    required: false,
  })
  @IsOptional()
  @IsString()
  career?: string;

  @ApiProperty({ example: 'QB', description: '주포지션', required: false })
  @IsOptional()
  @IsString()
  position?: string;
}
