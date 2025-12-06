// src/pages/Service/GuestLeagueTeamPage.jsx
import StatTeam from '../../../../../components/Stat/StatTeam_fixed';
import { TEAMS } from '../../../../../data/TEAMS';
import { TEAM_STATS_2024_SEOUL_1 } from '../../../../../data/fall2024';

const GuestLeagueTeamPage = () => {
  return (
    <div>
      <StatTeam
        teams={TEAMS}
        fixedLeague="서울"
        fixedDivision="1부"
      />
    </div>
  );
};
export default GuestLeagueTeamPage;
