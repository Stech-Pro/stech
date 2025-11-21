import { Injectable } from '@nestjs/common';

@Injectable()
export class SlackService {
  private readonly slackToken = process.env.SLACK_BOT_TOKEN || '';
  private readonly channelId = process.env.SLACK_CHANNEL_ID || 'C09CRFMURD5';

  async sendGameDataEditRequest(requestData: {
    gameKey: string;
    clipKey: string;
    requesterName: string;
    requesterTeam: string;
    requesterRole: string;
    requestTime: string;
    reason?: string;
  }) {
    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.slackToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: this.channelId,
          text: '경기 데이터 수정 요청',
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🏈 경기 데이터 수정 요청',
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*게임:*\n${requestData.gameKey}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*클립:*\n${requestData.clipKey}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*요청자:*\n${requestData.requesterName}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*팀:*\n${requestData.requesterTeam}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*역할:*\n${this.getRoleDisplayName(requestData.requesterRole)}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*요청 시간:*\n${requestData.requestTime}`,
                },
              ],
            },
            ...(requestData.reason
              ? [
                  {
                    type: 'section',
                    text: {
                      type: 'mrkdwn',
                      text: `*수정 사유:*\n${requestData.reason}`,
                    },
                  },
                ]
              : []),
            {
              type: 'divider',
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: '📺 클립 영상 우클릭을 통한 수정 요청입니다.',
                },
              ],
            },
          ],
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(`Slack API 오류: ${result.error}`);
      }

      return {
        success: true,
        message: 'Slack 메시지가 성공적으로 전송되었습니다.',
        slackResponse: result,
      };
    } catch (error) {
      console.error('Slack 메시지 전송 실패:', error);
      throw new Error(`Slack 메시지 전송 실패: ${error.message}`);
    }
  }

  private getRoleDisplayName(role: string): string {
    const roleMap = {
      player: '선수',
      coach: '코치',
      admin: '관리자',
    };
    return roleMap[role] || role;
  }
}
