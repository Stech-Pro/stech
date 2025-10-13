import StatLeague from "../../../../../components/Stat/StatLeague";
import {FALL_2024_DATA} from "../../../../../data/fall2024";
import {FALL_2025_DATA} from "../../../../../data/fall2025";
import {TEAMS } from "../../../../../data/TEAMS";
import { useMemo } from "react";

const LeaguePage = () => {
  const MERGED_FALL_DATA = useMemo(
    () => ({ ...FALL_2024_DATA, ...FALL_2025_DATA }),
    []
  );

  return <StatLeague data={MERGED_FALL_DATA} teams={TEAMS} /> ;
};

export default LeaguePage;
