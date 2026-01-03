import TeamQuickView from "../components/Teams/TeamQuickView";
import styles from "./Teams.module.css";

export default function Teams() {
  return (
    <main>
      <div className={styles.teamsGrid}>
        <TeamQuickView
          teamData="/aqua/teamdata.json"
        />
        <TeamQuickView
          teamData="/creature/teamdata.json"
        />
        <TeamQuickView
          teamData="/diva/teamdata.json"
        />
        <TeamQuickView
          teamData="/feathers/teamdata.json"
        />
        <TeamQuickView
          teamData="/primate/teamdata.json"
        />
        <TeamQuickView
          teamData="/scales/teamdata.json"
        />
        <TeamQuickView
          teamData="/silly/teamdata.json"
        />
        <TeamQuickView
          teamData="/smalls/teamdata.json"
        />
      </div>
    </main>
  );
}