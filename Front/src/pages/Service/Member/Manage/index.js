import { useState, useEffect } from 'react';
import { leaveTeam, myTeamStats } from '../../../../api/authAPI';
import { useAuth } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TEAM_BY_ID } from '../../../../data/TEAMS';

const ManagePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [teamData, setTeamData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    const token = localStorage.getItem('token');

    try {
      setLoading(true);
      const response = await myTeamStats(token);
      const data = response.data;

      setTeamData({
        teamName: data.teamName,
        league: data.teamRegion,
      });

      // stats 객체에서 모든 포지션의 선수들을 추출
      if (data?.stats) {
        const allPlayers = [];
        Object.keys(data.stats).forEach((position) => {
          if (Array.isArray(data.stats[position])) {
            allPlayers.push(...data.stats[position]);
          }
        });
        setMembers(allPlayers);
      }
    } catch (error) {
      console.error('팀 정보 조회 실패:', error);
      toast.error('팀 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (
      !window.confirm(
        '정말 팀을 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      )
    ) {
      return;
    }

    try {
      await leaveTeam();
      toast.success('팀에서 탈퇴했습니다.');
      // 프로필 재설정 페이지로 이동
      navigate('/auth/signup/profile');
    } catch (error) {
      console.error('팀 탈퇴 실패:', error);
      toast.error('팀 탈퇴에 실패했습니다.');
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`${memberName} 선수를 팀에서 내보내시겠습니까?`)) {
      return;
    }

    try {
      // TODO: 백엔드에 선수 제거 API 추가 필요
      // await removeMemberFromTeam(memberId);
      toast.error('선수 내보내기 기능은 아직 구현되지 않았습니다.');
      // fetchTeamData();
    } catch (error) {
      console.error('선수 제거 실패:', error);
      toast.error('선수를 내보내는데 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-white">로딩 중...</div>
      </div>
    );
  }

  const teamMeta = TEAM_BY_ID[teamData.teamName] || '';

  return (
    <div className="min-h-screen bg-[#141414] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-2xl font-bold text-white md:text-3xl">
          팀 관리
        </h1>

        {/* 팀 정보 */}
        {teamData && (
          <div className="bg-[#1f1f1f] rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">팀 정보</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 text-white md:grid-cols-2">
              <div>
                <span className="text-gray-400">팀 이름:</span>
                <span className="ml-2 font-semibold">
                  {teamMeta.name || '-'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">리그:</span>
                <span className="ml-2 font-semibold">
                  {teamData.league || '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 팀 멤버 목록 */}
        <div className="bg-[#1f1f1f] rounded-lg p-6">
          <h2 className="mb-4 text-xl font-bold text-white">
            선수 관리 ({members.length}명)
          </h2>

          {members.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              선수가 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.playerId}
                  className="flex items-center justify-between bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#333] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {(member.playerName || '?')[0]}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">
                        {member.playerId || '이름 없음'}
                      </div>
                      <div className="text-sm text-gray-400">
                        {member.position || '포지션 정보 없음'}
                      </div>
                    </div>
                  </div>

                  {/* 본인은 내보낼 수 없음 */}
                  {member.playerId !== user?.playerId && (
                    <button
                      onClick={() =>
                        handleRemoveMember(member.playerId, member.playerName)
                      }
                      className="px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
                    >
                      내보내기
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagePage;
