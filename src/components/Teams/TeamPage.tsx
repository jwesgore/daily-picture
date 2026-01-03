

interface TeamPageProps {
  teamName: string;
  teamDescription: string;
  teamMembers: [string, string, string, string];
  backgroundImage: string;
}

export default function TeamPage({}: TeamPageProps) {
  return <div>Team Page</div>;
}