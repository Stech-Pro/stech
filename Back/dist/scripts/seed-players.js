"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = seedDatabase;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const mongoose_1 = require("@nestjs/mongoose");
const koreanNames = [
    '김민수', '이준호', '박성우', '정민재', '최영준', '강태현', '조현우', '윤도현',
    '임재혁', '송민석', '한지우', '오승환', '류창현', '신동현', '홍성민', '장우진',
    '권혁진', '배준영', '서민호', '남궁훈', '문성호', '노태윤', '유재석', '허준혁',
    '고민성', '위성진', '하준수', '변우석', '안재현', '표지훈', '구본승', '도경수',
    '소지섭', '방시혁', '사공민', '제갈민', '황보성', '선우진', '독고준', '남궁민'
];
const teamsData = [
    {
        teamId: 'HFBlackKnights',
        teamName: '한국외대 블랙나이츠',
        logoUrl: '/assets/images/svg/teams/HUFS.svg'
    },
    {
        teamId: 'HYLions',
        teamName: '한양대 라이온즈',
        logoUrl: '/assets/images/svg/teams/Hanyang.svg'
    }
];
const playersData = {
    HFBlackKnights: [
        { jerseyNumber: 9, position: 'QB' },
        { jerseyNumber: 10, position: 'WR' },
        { jerseyNumber: 11, position: 'WR' },
        { jerseyNumber: 18, position: 'RB' },
        { jerseyNumber: 19, position: 'WR' },
        { jerseyNumber: 20, position: 'WR' },
        { jerseyNumber: 22, position: 'RB' },
        { jerseyNumber: 7, position: 'RB' },
        { jerseyNumber: 87, position: 'TE' },
        { jerseyNumber: 0, position: 'DB' },
        { jerseyNumber: 2, position: 'DB' },
        { jerseyNumber: 5, position: 'LB' },
        { jerseyNumber: 6, position: 'LB' },
        { jerseyNumber: 24, position: 'DB' },
        { jerseyNumber: 33, position: 'LB' },
        { jerseyNumber: 37, position: 'DB' },
        { jerseyNumber: 45, position: 'LB' },
        { jerseyNumber: 56, position: 'LB' },
        { jerseyNumber: 58, position: 'LB' },
        { jerseyNumber: 59, position: 'LB' }
    ],
    HYLions: [
        { jerseyNumber: 15, position: 'QB' },
        { jerseyNumber: 18, position: 'WR' },
        { jerseyNumber: 20, position: 'RB' },
        { jerseyNumber: 23, position: 'RB' },
        { jerseyNumber: 26, position: 'RB' },
        { jerseyNumber: 27, position: 'DB' },
        { jerseyNumber: 44, position: 'RB' },
        { jerseyNumber: 87, position: 'TE' },
        { jerseyNumber: 88, position: 'WR' },
        { jerseyNumber: 62, position: 'DL' },
        { jerseyNumber: 65, position: 'DL' },
        { jerseyNumber: 69, position: 'DL' },
        { jerseyNumber: 78, position: 'DL' },
        { jerseyNumber: 84, position: 'LB' },
        { jerseyNumber: 86, position: 'LB' },
        { jerseyNumber: 92, position: 'DL' }
    ]
};
async function seedDatabase() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        console.log('🚀 더미 데이터 생성 시작...');
        const userModel = app.get((0, mongoose_1.getModelToken)('User'));
        const teamModel = app.get((0, mongoose_1.getModelToken)('Team'));
        const playerModel = app.get((0, mongoose_1.getModelToken)('Player'));
        console.log('🗑️  기존 데이터 정리...');
        await playerModel.deleteMany({});
        await teamModel.deleteMany({});
        console.log('👤 더미 유저 생성...');
        const dummyUser = await userModel.create({
            email: 'admin@stech.com',
            name: '관리자',
            password: 'hashedpassword',
            isEmailVerified: true
        });
        console.log('🏈 팀 데이터 생성...');
        const createdTeams = {};
        for (const teamData of teamsData) {
            const team = await teamModel.create({
                ...teamData,
                ownerId: dummyUser._id
            });
            createdTeams[teamData.teamId] = team;
            console.log(`✅ 팀 생성: ${team.teamName}`);
        }
        console.log('🏃‍♂️ 선수 데이터 생성...');
        let nameIndex = 0;
        for (const [teamId, players] of Object.entries(playersData)) {
            const team = createdTeams[teamId];
            for (const playerData of players) {
                const name = koreanNames[nameIndex % koreanNames.length];
                nameIndex++;
                const player = await playerModel.create({
                    playerId: `${teamId}_${playerData.jerseyNumber}`,
                    name: name,
                    jerseyNumber: playerData.jerseyNumber,
                    position: playerData.position,
                    studentId: `202${Math.floor(Math.random() * 10)}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
                    email: `${name.replace(/\s/g, '').toLowerCase()}@${teamId.toLowerCase()}.edu`,
                    nickname: name.split(' ')[0],
                    teamId: team._id,
                    league: '1부',
                    season: '2024',
                    stats: {}
                });
                console.log(`✅ 선수 생성: ${player.name} (#${player.jerseyNumber}) - ${player.positions?.join(', ') || '없음'} (${team.teamName})`);
            }
        }
        const totalTeams = await teamModel.countDocuments();
        const totalPlayers = await playerModel.countDocuments();
        console.log('\n🎉 데이터 생성 완료!');
        console.log(`📊 생성된 팀: ${totalTeams}개`);
        console.log(`👥 생성된 선수: ${totalPlayers}명`);
        for (const [teamId, team] of Object.entries(createdTeams)) {
            const teamDoc = team;
            const playerCount = await playerModel.countDocuments({ teamId: teamDoc._id });
            console.log(`   - ${teamDoc.teamName}: ${playerCount}명`);
        }
    }
    catch (error) {
        console.error('❌ 에러 발생:', error);
    }
    finally {
        await app.close();
    }
}
if (require.main === module) {
    seedDatabase()
        .then(() => {
        console.log('✅ 스크립트 완료');
        process.exit(0);
    })
        .catch((error) => {
        console.error('❌ 스크립트 실행 실패:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed-players.js.map