"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewGameDataProcessorService = void 0;
const common_1 = require("@nestjs/common");
let NewGameDataProcessorService = class NewGameDataProcessorService {
    processGameData(gameData) {
        const { gameKey, homeTeam, awayTeam, Clips } = gameData;
        console.log(`게임 데이터 전처리 시작 - ${gameKey}: ${homeTeam} vs ${awayTeam}`);
        console.log(`총 클립 수: ${Clips.length}개`);
        const processedClips = Clips.map((clip) => {
            const actualOffensiveTeam = clip.offensiveTeam === 'Home' ? homeTeam : awayTeam;
            const actualDefensiveTeam = clip.offensiveTeam === 'Home' ? awayTeam : homeTeam;
            return {
                clipKey: clip.clipKey,
                offensiveTeam: clip.offensiveTeam,
                quarter: clip.quarter,
                down: clip.down,
                toGoYard: clip.toGoYard,
                playType: clip.playType,
                specialTeam: clip.specialTeam,
                start: clip.start,
                end: clip.end,
                gainYard: clip.gainYard,
                car: clip.car,
                car2: clip.car2,
                tkl: clip.tkl,
                tkl2: clip.tkl2,
                significantPlays: clip.significantPlays,
                actualOffensiveTeam,
                actualDefensiveTeam,
            };
        });
        console.log(`전처리 완료 - ${processedClips.length}개 클립`);
        return {
            gameKey,
            homeTeam,
            awayTeam,
            processedClips,
        };
    }
    findAllQBs(processedClips) {
        const qbMap = new Map();
        for (const clip of processedClips) {
            if (clip.car?.pos === 'QB') {
                const key = `${clip.actualOffensiveTeam}-${clip.car.num}`;
                if (!qbMap.has(key)) {
                    qbMap.set(key, {
                        jerseyNumber: clip.car.num,
                        teamName: clip.actualOffensiveTeam,
                    });
                }
            }
            if (clip.car2?.pos === 'QB') {
                const key = `${clip.actualOffensiveTeam}-${clip.car2.num}`;
                if (!qbMap.has(key)) {
                    qbMap.set(key, {
                        jerseyNumber: clip.car2.num,
                        teamName: clip.actualOffensiveTeam,
                    });
                }
            }
        }
        console.log(`발견된 QB 수: ${qbMap.size}명`);
        for (const [key, qbInfo] of qbMap) {
            console.log(`  - ${qbInfo.teamName} ${qbInfo.jerseyNumber}번 QB`);
        }
        return qbMap;
    }
    filterClipsForPlayer(processedClips, jerseyNumber, teamName) {
        return processedClips.filter((clip) => {
            if (clip.actualOffensiveTeam !== teamName)
                return false;
            const isPlayerInCar = clip.car?.num === jerseyNumber;
            const isPlayerInCar2 = clip.car2?.num === jerseyNumber;
            return isPlayerInCar || isPlayerInCar2;
        });
    }
};
exports.NewGameDataProcessorService = NewGameDataProcessorService;
exports.NewGameDataProcessorService = NewGameDataProcessorService = __decorate([
    (0, common_1.Injectable)()
], NewGameDataProcessorService);
//# sourceMappingURL=new-game-data-processor.service.js.map