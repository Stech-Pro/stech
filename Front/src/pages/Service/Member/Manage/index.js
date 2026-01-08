import { useState, useEffect } from 'react';
import { leaveTeam, myTeamPlayers, removePlayer } from '../../../../api/authAPI';
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
      const response = await myTeamPlayers(token);
      console.log('API Response:', response);

      // response.data가 실제 데이터인지 확인
      const data = response?.data?.data || response?.data || response;
      console.log('Extracted data:', data);

      if (data) {
        setTeamData({
          teamName: data.teamName || '',
          league: data.teamRegion || '',
          totalPlayers: data.totalPlayers || 0,
        });

        // players 배열 직접 사용
        if (data?.players && Array.isArray(data.players)) {
          setMembers(data.players);
        } else {
          setMembers([]);
        }
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

  const handleRemoveMember = async (playerId, playerName) => {
    if (!window.confirm(`${playerName} 선수를 팀에서 내보내시겠습니까?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await removePlayer(token, playerId);
      toast.success(`${playerName} 선수를 팀에서 내보냈습니다.`);
      fetchTeamData(); // 팀원 목록 새로고침
    } catch (error) {
      console.error('선수 제거 실패:', error);
      toast.error(error.message || '선수를 내보내는데 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-white">로딩 중...</div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-white">팀 정보를 불러올 수 없습니다.</div>
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
              {members.map((member, index) => (
                <div
                  key={`${member.playerName}-${index}`}
                  className="flex items-center justify-between bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#333] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#3a3a3a] flex items-center justify-center overflow-hidden">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.playerName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-lg font-bold text-white">
                          {(member.playerName || '?')[0]}
                        </span>
                      )}
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {member.playerName || '이름 없음'}
                        </span>
                        {member.jerseyNumber && (
                          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-[#444] rounded">
                            #{member.jerseyNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {Array.isArray(member.position)
                          ? member.position.join(', ')
                          : member.position || '포지션 정보 없음'}
                      </div>
                    </div>
                  </div>

                  {/* 본인은 내보낼 수 없음 */}
                  {member.playerName !== user?.playerName && (
                    <button
                      onClick={() =>
                        handleRemoveMember(member.playerName, member.playerName)
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
