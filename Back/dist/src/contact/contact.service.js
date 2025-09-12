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
exports.ContactService = void 0;
const common_1 = require("@nestjs/common");
const web_api_1 = require("@slack/web-api");
let ContactService = class ContactService {
    slack;
    contactChannel;
    constructor() {
        const token = process.env.SLACK_BOT_TOKEN;
        const channel = process.env.SLACK_CONTACT_CHANNEL;
        console.log('Slack 설정 - Token:', token ? '있음' : '없음', 'Channel:', channel);
        if (token && channel) {
            this.slack = new web_api_1.WebClient(token);
            this.contactChannel = channel;
            console.log('Slack 설정 완료');
        }
        else {
            console.error('SLACK_BOT_TOKEN 또는 SLACK_CONTACT_CHANNEL이 없습니다');
        }
    }
    async processContact(contactData) {
        console.log('processContact 호출됨:', contactData);
        if (!this.slack || !this.contactChannel) {
            console.log('Slack 설정이 없어서 콘솔에만 출력합니다');
            console.log('=== Contact 정보 ===');
            console.log('이름:', contactData.fullName);
            console.log('이메일:', contactData.email);
            console.log('문의 이유:', contactData.reason);
            console.log('문의 내용:', contactData.message);
            console.log('==================');
            return { contactId: 'CONTACT_' + Date.now() };
        }
        try {
            const contactId = 'CONTACT_' + Date.now();
            const slackMessage = {
                channel: this.contactChannel,
                text: '새로운 StechPro 문의가 접수되었습니다!',
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '📬 새로운 Contact 문의',
                            emoji: true,
                        },
                    },
                    {
                        type: 'divider',
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*👤 이름:*\n${contactData.fullName}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*📧 이메일:*\n${contactData.email}`,
                            },
                        ],
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*⏰ 접수 시간:*\n${new Date().toLocaleString('ko-KR')}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*🆔 문의 ID:*\n${contactId}`,
                            },
                        ],
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*❓ 문의 이유:*\n${contactData.reason}`,
                        },
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*💬 문의 내용:*\n${contactData.message}`,
                        },
                    },
                    {
                        type: 'divider',
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*📧 답변하기:*\n이메일: \`${contactData.email}\`\n제목: \`Re: StechPro 문의 답변\`\n\n위 이메일 주소를 복사해서 메일 프로그램에서 답변을 보내세요.`,
                        },
                    },
                    {
                        type: 'context',
                        elements: [
                            {
                                type: 'mrkdwn',
                                text: '💡 이메일 주소를 클릭하거나 드래그해서 복사할 수 있습니다.',
                            },
                        ],
                    },
                ],
            };
            console.log('Slack 메시지 전송 시도');
            const result = await this.slack.chat.postMessage(slackMessage);
            if (!result.ok) {
                console.error('Slack 전송 실패:', result.error);
                console.log('Slack 실패했지만 정보를 콘솔에 출력했습니다');
            }
            else {
                console.log('Slack 메시지 전송 성공');
            }
            return { contactId };
        }
        catch (error) {
            console.error('Slack 전송 에러:', error);
            console.log('에러 발생했지만 콘솔에 정보를 출력했습니다');
            return { contactId: 'CONTACT_' + Date.now() };
        }
    }
};
exports.ContactService = ContactService;
exports.ContactService = ContactService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ContactService);
//# sourceMappingURL=contact.service.js.map