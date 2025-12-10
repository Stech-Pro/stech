import StatTeam from '../../../../../components/Stat/StatTeam_fixed';
import { TEAMS } from '../../../../../data/TEAMS';
const LeagueTeamPage = () => {
  // StatTeam_fixed는 자체적으로 하드코딩된 KAFA 데이터를 사용하므로 별도 데이터 로딩 불필요
  return <StatTeam  teams={TEAMS}/>;
};

export default LeagueTeamPage;