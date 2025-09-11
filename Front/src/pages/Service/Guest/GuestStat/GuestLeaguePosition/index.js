import StatPosition from "../../../../../components/Stat/StatPosition";
import {TEAMS} from "../../../../../data/TEAMS";
import {POSITION_STATS_2024_SEOUL_1} from "../../../../../data/fall2024";

const GuestLeagueLPositionPage = () => {
    return (
        <div>
            <StatPosition  data= {POSITION_STATS_2024_SEOUL_1} teams={TEAMS} />
        </div>
    );
}
export default GuestLeagueLPositionPage;