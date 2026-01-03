import TeamQuickView from "../components/Teams/TeamQuickView";
import styles from "./Teams.module.css";

export default function Teams() {
  return (
    <main>
      <div className={styles.teamsGrid}>
        <TeamQuickView
          backgroundImage="/images/aqua/background.jpg"
          teamMembers={[
              "/images/aqua/team-aqua-001-thumb.jpg",
              "/images/aqua/team-aqua-002-thumb.jpg",
              "/images/aqua/team-aqua-003-thumb.jpg",
              "/images/aqua/team-aqua-004-thumb.jpg",
          ]}
          text="Team Aqua"
        />
        <TeamQuickView
          backgroundImage=""
          teamMembers={[
              "/images/creature/team-creature-001-thumb.jpg",
              "/images/creature/team-creature-002-thumb.jpg",
              "/images/creature/team-creature-003-thumb.jpg",
              "/images/creature/team-creature-004-thumb.jpg",
          ]}
          text="Team Creature"
        />
        <TeamQuickView
          backgroundImage=""
          teamMembers={[
              "/images/diva/team-diva-001-thumb.jpg",
              "/images/diva/team-diva-002-thumb.jpg",
              "/images/diva/team-diva-003-thumb.jpg",
              "/images/diva/team-diva-004-thumb.jpg",
          ]}
          text="Team Diva"
        />
        <TeamQuickView
          backgroundImage=""
          teamMembers={[
              "/images/feathers/team-feathers-001-thumb.jpg",
              "/images/feathers/team-feathers-002-thumb.jpg",
              "/images/feathers/team-feathers-003-thumb.jpg",
              "/images/feathers/team-feathers-004-thumb.jpg",
          ]}
          text="Team Feathers"
        />
        <TeamQuickView
          backgroundImage=""
          teamMembers={[
              "/images/primate/team-primate-001-thumb.jpg",
              "/images/primate/team-primate-002-thumb.jpg",
              "/images/primate/team-primate-003-thumb.jpg",
              "/images/primate/team-primate-004-thumb.jpg",
          ]}
          text="Team Primate"
        />
        <TeamQuickView
          backgroundImage=""
          teamMembers={[
              "/images/scales/team-scales-001-thumb.jpg",
              "/images/scales/team-scales-002-thumb.jpg",
              "/images/scales/team-scales-003-thumb.jpg",
              "/images/scales/team-scales-004-thumb.jpg",
          ]}
          text="Team Scales"
        />
        <TeamQuickView
          backgroundImage=""
          teamMembers={[
              "/images/silly/team-silly-001-thumb.jpg",
              "/images/silly/team-silly-002-thumb.jpg",
              "/images/silly/team-silly-003-thumb.jpg",
              "/images/silly/team-silly-004-thumb.jpg",
          ]}
          text="Team Silly"
          teamLink="/teams/silly"
          teamMemberLinks={[
            "/teams/silly/001", 
            "/teams/silly/002", 
            "/teams/silly/003", 
            "/teams/silly/004"
          ]}
        />
        <TeamQuickView
          backgroundImage=""
          teamMembers={[
              "/images/smalls/team-smalls-001-thumb.jpg",
              "/images/smalls/team-smalls-002-thumb.jpg",
              "/images/smalls/team-smalls-003-thumb.jpg",
              "/images/smalls/team-smalls-004-thumb.jpg",
          ]}
          text="Team Smalls"
          teamLink="/teams/smalls"
          teamMemberLinks={[
            "/teams/smalls/001", 
            "/teams/smalls/002", 
            "/teams/smalls/003", 
            "/teams/smalls/004"
          ]}
        />
      </div>
    </main>
  );
}