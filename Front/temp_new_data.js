// 새로운 리그별 1부/2부 구조 데이터
const newKafaData = {
  서울: {
    first: {
      team: {
        offense: {
          rushing: [
            { teamName: '한양대학교', rushingYards: 879, yardsPerCarry: 4.4, rushingTouchdowns: 7, longestRush: 54 },
            { teamName: '연세대학교', rushingYards: 800, yardsPerCarry: 4.7, rushingTouchdowns: 11, longestRush: 68 },
            { teamName: '서울대학교', rushingYards: 394, yardsPerCarry: 5.0, rushingTouchdowns: 2, longestRush: 39 },
            { teamName: '건국대학교', rushingYards: 289, yardsPerCarry: 4.8, rushingTouchdowns: 1, longestRush: 32 },
            { teamName: '홍익대학교', rushingYards: 563, yardsPerCarry: 5.1, rushingTouchdowns: 3, longestRush: 54 },
          ],
          passing: [
            { teamName: '연세대학교', passingYards: 968, yardsPerAttempt: 6.3, completionPercentage: 48.1, attempts: 154, completions: 74, passingTouchdowns: 20, interceptions: 8, longestPass: 80 },
            { teamName: '한양대학교', passingYards: 481, yardsPerAttempt: 4.6, completionPercentage: 42.9, attempts: 105, completions: 45, passingTouchdowns: 7, interceptions: 9, longestPass: 57 },
            { teamName: '서울대학교', passingYards: 227, yardsPerAttempt: 3.6, completionPercentage: 41.3, attempts: 63, completions: 26, passingTouchdowns: 1, interceptions: 8, longestPass: 33 },
            { teamName: '건국대학교', passingYards: 85, yardsPerAttempt: 2.3, completionPercentage: 48.6, attempts: 37, completions: 18, passingTouchdowns: 0, interceptions: 3, longestPass: 24 },
            { teamName: '홍익대학교', passingYards: 245, yardsPerAttempt: 4.2, completionPercentage: 45.0, attempts: 58, completions: 26, passingTouchdowns: 3, interceptions: 5, longestPass: 42 },
          ],
          receiving: [
            { teamName: '연세대학교', receptions: 74, receivingYards: 968, yardsPerTarget: 6.3, targets: 154, receivingTouchdowns: 20, longestReception: 80 },
            { teamName: '한양대학교', receptions: 45, receivingYards: 481, yardsPerTarget: 4.6, targets: 105, receivingTouchdowns: 7, longestReception: 57 },
            { teamName: '서울대학교', receptions: 26, receivingYards: 227, yardsPerTarget: 3.6, targets: 63, receivingTouchdowns: 1, longestReception: 33 },
            { teamName: '건국대학교', receptions: 18, receivingYards: 85, yardsPerTarget: 2.3, targets: 37, receivingTouchdowns: 0, longestReception: 24 },
            { teamName: '홍익대학교', receptions: 26, receivingYards: 245, yardsPerTarget: 4.2, targets: 58, receivingTouchdowns: 3, longestReception: 42 },
          ]
        },
        defense: {
          tackles: [
            { teamName: '연세대학교', tackles: 95, sacks: 12, soloTackles: 58, assistTackles: 37 },
            { teamName: '한양대학교', tackles: 89, sacks: 8, soloTackles: 54, assistTackles: 35 },
            { teamName: '서울대학교', tackles: 72, sacks: 5, soloTackles: 45, assistTackles: 27 },
            { teamName: '건국대학교', tackles: 68, sacks: 4, soloTackles: 42, assistTackles: 26 },
            { teamName: '홍익대학교', tackles: 75, sacks: 6, soloTackles: 46, assistTackles: 29 },
          ],
          interceptions: [
            { teamName: '연세대학교', interceptions: 8, interceptionTd: 2, interceptionYards: 128, longestInterception: 68 },
            { teamName: '한양대학교', interceptions: 5, interceptionTd: 0, interceptionYards: 65, longestInterception: 38 },
            { teamName: '서울대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 48, longestInterception: 25 },
            { teamName: '건국대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 32, longestInterception: 22 },
            { teamName: '홍익대학교', interceptions: 5, interceptionTd: 1, interceptionYards: 58, longestInterception: 35 },
          ]
        },
        special: {
          kicking: [
            { teamName: '건국대학교', fieldGoalPercentage: 100, avgFieldGoalDistance: 53, fieldGoalsMade: 1, fieldGoalAttempts: 1, fieldGoalYards: 53, longestFieldGoal: 53 },
            { teamName: '연세대학교', fieldGoalPercentage: 80, avgFieldGoalDistance: 20.5, fieldGoalsMade: 4, fieldGoalAttempts: 5, fieldGoalYards: 82, longestFieldGoal: 25 },
            { teamName: '한양대학교', fieldGoalPercentage: 75, avgFieldGoalDistance: 18.3, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 55, longestFieldGoal: 25 },
            { teamName: '서울대학교', fieldGoalPercentage: 75, avgFieldGoalDistance: 24, fieldGoalsMade: 3, fieldGoalAttempts: 4, fieldGoalYards: 72, longestFieldGoal: 24 },
            { teamName: '홍익대학교', fieldGoalPercentage: 60, avgFieldGoalDistance: 22, fieldGoalsMade: 3, fieldGoalAttempts: 5, fieldGoalYards: 66, longestFieldGoal: 28 },
          ],
          punting: [
            { teamName: '서울대학교', avgPuntYards: 54.6, puntCount: 10, puntYards: 546, puntTouchdowns: 0, longestPunt: 65 },
            { teamName: '한양대학교', avgPuntYards: 43.3, puntCount: 26, puntYards: 1126, puntTouchdowns: 0, longestPunt: 65 },
            { teamName: '연세대학교', avgPuntYards: 42.1, puntCount: 40, puntYards: 1684, puntTouchdowns: 0, longestPunt: 75 },
            { teamName: '건국대학교', avgPuntYards: 17.8, puntCount: 6, puntYards: 107, puntTouchdowns: 0, longestPunt: 54 },
            { teamName: '홍익대학교', avgPuntYards: 38.5, puntCount: 18, puntYards: 693, puntTouchdowns: 0, longestPunt: 58 },
          ]
        }
      }
    },
    second: {
      team: {
        offense: {
          rushing: [
            { teamName: '고려대학교', rushingYards: 796, yardsPerCarry: 5.8, rushingTouchdowns: 7, longestRush: 59 },
            { teamName: '중앙대학교', rushingYards: 370, yardsPerCarry: 5.4, rushingTouchdowns: 4, longestRush: 55 },
            { teamName: '숭실대학교', rushingYards: 368, yardsPerCarry: 4.1, rushingTouchdowns: 2, longestRush: 28 },
          ],
          passing: [
            { teamName: '고려대학교', passingYards: 527, yardsPerAttempt: 5.3, completionPercentage: 58.0, attempts: 100, completions: 58, passingTouchdowns: 6, interceptions: 2, longestPass: 37 },
            { teamName: '숭실대학교', passingYards: 170, yardsPerAttempt: 2.6, completionPercentage: 52.3, attempts: 65, completions: 34, passingTouchdowns: 6, interceptions: 4, longestPass: 33 },
            { teamName: '중앙대학교', passingYards: 61, yardsPerAttempt: 2.5, completionPercentage: 29.2, attempts: 24, completions: 7, passingTouchdowns: 0, interceptions: 4, longestPass: 12 },
          ],
          receiving: [
            { teamName: '고려대학교', receptions: 58, receivingYards: 527, yardsPerTarget: 5.3, targets: 100, receivingTouchdowns: 6, longestReception: 37 },
            { teamName: '숭실대학교', receptions: 34, receivingYards: 170, yardsPerTarget: 2.6, targets: 65, receivingTouchdowns: 6, longestReception: 33 },
            { teamName: '중앙대학교', receptions: 7, receivingYards: 61, yardsPerTarget: 2.5, targets: 24, receivingTouchdowns: 0, longestReception: 12 },
          ]
        },
        defense: {
          tackles: [
            { teamName: '고려대학교', tackles: 82, sacks: 9, soloTackles: 49, assistTackles: 33 },
            { teamName: '중앙대학교', tackles: 76, sacks: 6, soloTackles: 45, assistTackles: 31 },
            { teamName: '숭실대학교', tackles: 70, sacks: 4, soloTackles: 42, assistTackles: 28 },
          ],
          interceptions: [
            { teamName: '고려대학교', interceptions: 6, interceptionTd: 1, interceptionYards: 78, longestInterception: 42 },
            { teamName: '중앙대학교', interceptions: 4, interceptionTd: 1, interceptionYards: 52, longestInterception: 28 },
            { teamName: '숭실대학교', interceptions: 3, interceptionTd: 0, interceptionYards: 28, longestInterception: 18 },
          ]
        },
        special: {
          kicking: [
            { teamName: '고려대학교', fieldGoalPercentage: 66.7, avgFieldGoalDistance: 25.2, fieldGoalsMade: 6, fieldGoalAttempts: 9, fieldGoalYards: 151, longestFieldGoal: 35 },
            { teamName: '중앙대학교', fieldGoalPercentage: 50.0, avgFieldGoalDistance: 20.0, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 40, longestFieldGoal: 25 },
            { teamName: '숭실대학교', fieldGoalPercentage: 33.3, avgFieldGoalDistance: 18.0, fieldGoalsMade: 1, fieldGoalAttempts: 3, fieldGoalYards: 18, longestFieldGoal: 18 },
          ],
          punting: [
            { teamName: '고려대학교', avgPuntYards: 35.8, puntCount: 28, puntYards: 1002, puntTouchdowns: 0, longestPunt: 48 },
            { teamName: '중앙대학교', avgPuntYards: 33.5, puntCount: 26, puntYards: 871, puntTouchdowns: 0, longestPunt: 44 },
            { teamName: '숭실대학교', avgPuntYards: 32.2, puntCount: 28, puntYards: 902, puntTouchdowns: 0, longestPunt: 42 },
          ]
        }
      }
    }
  },
  경기강원: {
    first: {
      team: {
        offense: {
          rushing: [
            { teamName: '성균관대학교', rushingYards: 173, yardsPerCarry: 2.6, rushingTouchdowns: 5, longestRush: 38 },
            { teamName: '강원대학교', rushingYards: 535, yardsPerCarry: 3.8, rushingTouchdowns: 6, longestRush: 43 },
          ],
          passing: [
            { teamName: '성균관대학교', passingYards: 541, yardsPerAttempt: 3.9, completionPercentage: 29.0, attempts: 138, completions: 40, passingTouchdowns: 5, interceptions: 9, longestPass: 59 },
            { teamName: '강원대학교', passingYards: 218, yardsPerAttempt: 3.8, completionPercentage: 36.8, attempts: 57, completions: 21, passingTouchdowns: 0, interceptions: 4, longestPass: 33 },
          ],
          receiving: [
            { teamName: '성균관대학교', receptions: 40, receivingYards: 541, yardsPerTarget: 3.9, targets: 138, receivingTouchdowns: 5, longestReception: 59 },
            { teamName: '강원대학교', receptions: 21, receivingYards: 218, yardsPerTarget: 3.8, targets: 57, receivingTouchdowns: 0, longestReception: 33 },
          ]
        },
        defense: {
          tackles: [
            { teamName: '성균관대학교', tackles: 78, sacks: 7, soloTackles: 47, assistTackles: 31 },
            { teamName: '강원대학교', tackles: 74, sacks: 6, soloTackles: 44, assistTackles: 30 },
          ],
          interceptions: [
            { teamName: '성균관대학교', interceptions: 5, interceptionTd: 1, interceptionYards: 58, longestInterception: 32 },
            { teamName: '강원대학교', interceptions: 4, interceptionTd: 0, interceptionYards: 42, longestInterception: 25 },
          ]
        },
        special: {
          kicking: [
            { teamName: '성균관대학교', fieldGoalPercentage: 55.0, avgFieldGoalDistance: 22.5, fieldGoalsMade: 5, fieldGoalAttempts: 9, fieldGoalYards: 113, longestFieldGoal: 32 },
            { teamName: '강원대학교', fieldGoalPercentage: 42.9, avgFieldGoalDistance: 20.3, fieldGoalsMade: 3, fieldGoalAttempts: 7, fieldGoalYards: 61, longestFieldGoal: 25 },
          ],
          punting: [
            { teamName: '성균관대학교', avgPuntYards: 48.0, puntCount: 15, puntYards: 720, puntTouchdowns: 0, longestPunt: 65 },
            { teamName: '강원대학교', avgPuntYards: 47.2, puntCount: 13, puntYards: 613, puntTouchdowns: 0, longestPunt: 60 },
          ]
        }
      }
    },
    second: {
      team: {
        offense: {
          rushing: [
            { teamName: '용인대학교', rushingYards: 258, yardsPerCarry: 7.4, rushingTouchdowns: 2, longestRush: 63 },
          ],
          passing: [
            { teamName: '용인대학교', passingYards: 330, yardsPerAttempt: 7.9, completionPercentage: 47.6, attempts: 42, completions: 20, passingTouchdowns: 7, interceptions: 3, longestPass: 72 },
          ],
          receiving: [
            { teamName: '용인대학교', receptions: 20, receivingYards: 330, yardsPerTarget: 7.9, targets: 42, receivingTouchdowns: 7, longestReception: 72 },
          ]
        },
        defense: {
          tackles: [
            { teamName: '용인대학교', tackles: 68, sacks: 3, soloTackles: 40, assistTackles: 28 },
          ],
          interceptions: [
            { teamName: '용인대학교', interceptions: 5, interceptionTd: 1, interceptionYards: 65, longestInterception: 35 },
          ]
        },
        special: {
          kicking: [
            { teamName: '용인대학교', fieldGoalPercentage: 50, avgFieldGoalDistance: 22, fieldGoalsMade: 2, fieldGoalAttempts: 4, fieldGoalYards: 44, longestFieldGoal: 24 },
          ],
          punting: [
            { teamName: '용인대학교', avgPuntYards: 38.5, puntCount: 15, puntYards: 578, puntTouchdowns: 0, longestPunt: 52 },
          ]
        }
      }
    }
  },
  사회인: {
    team: {
      offense: {
        rushing: [
          { teamName: '부산 그리폰즈', rushingYards: 542, yardsPerCarry: 4.8, rushingTouchdowns: 7, longestRush: 38 },
          { teamName: '서울 골든이글스', rushingYards: 498, yardsPerCarry: 4.2, rushingTouchdowns: 5, longestRush: 32 },
          { teamName: '삼성 블루스톰', rushingYards: 456, yardsPerCarry: 3.9, rushingTouchdowns: 4, longestRush: 28 },
        ],
        passing: [
          { teamName: '서울 골든이글스', passingYards: 876, yardsPerAttempt: 6.8, completionPercentage: 62.3, attempts: 129, completions: 80, passingTouchdowns: 9, interceptions: 6, longestPass: 58 },
          { teamName: '부산 그리폰즈', passingYards: 834, yardsPerAttempt: 6.5, completionPercentage: 59.1, attempts: 128, completions: 76, passingTouchdowns: 8, interceptions: 7, longestPass: 52 },
          { teamName: '삼성 블루스톰', passingYards: 756, yardsPerAttempt: 5.9, completionPercentage: 55.8, attempts: 128, completions: 71, passingTouchdowns: 6, interceptions: 9, longestPass: 45 },
        ],
        receiving: [
          { teamName: '서울 골든이글스', receptions: 80, receivingYards: 876, yardsPerTarget: 6.8, targets: 129, receivingTouchdowns: 9, longestReception: 58 },
          { teamName: '부산 그리폰즈', receptions: 76, receivingYards: 834, yardsPerTarget: 6.5, targets: 128, receivingTouchdowns: 8, longestReception: 52 },
        ]
      },
      defense: {
        tackles: [
          { teamName: '부산 그리폰즈', tackles: 89, sacks: 8, soloTackles: 54, assistTackles: 35 },
          { teamName: '서울 골든이글스', tackles: 85, sacks: 6, soloTackles: 51, assistTackles: 34 },
        ],
        interceptions: [
          { teamName: '서울 골든이글스', interceptions: 6, interceptionTd: 1, interceptionYards: 78, longestInterception: 42 },
          { teamName: '부산 그리폰즈', interceptions: 4, interceptionTd: 0, interceptionYards: 52, longestInterception: 28 },
        ]
      },
      special: {
        kicking: [
          { teamName: '서울 골든이글스', fieldGoalPercentage: 75.0, avgFieldGoalDistance: 28.5, fieldGoalsMade: 9, fieldGoalAttempts: 12, fieldGoalYards: 257, longestFieldGoal: 42 },
          { teamName: '부산 그리폰즈', fieldGoalPercentage: 70.0, avgFieldGoalDistance: 26.8, fieldGoalsMade: 7, fieldGoalAttempts: 10, fieldGoalYards: 188, longestFieldGoal: 38 },
        ],
        punting: [
          { teamName: '부산 그리폰즈', avgPuntYards: 38.2, puntCount: 18, puntYards: 688, puntTouchdowns: 0, longestPunt: 55 },
          { teamName: '서울 골든이글스', avgPuntYards: 35.8, puntCount: 22, puntYards: 788, puntTouchdowns: 0, longestPunt: 48 },
        ]
      }
    }
  }
};