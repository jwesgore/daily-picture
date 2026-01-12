# Project Architecture

## Directory Structure

### `/src`

#### Core Application
- **`App.tsx`** - Main application component with routing setup
- **`main.tsx`** - Application entry point
- **`index.css`** - Global styles
- **`supabaseClient.ts`** - Supabase client configuration

#### `/types` - Type Definitions
Organized by domain for better modularity:
- **`domain.ts`** - Core domain models (Player, Team, Match)
- **`team.ts`** - Team-specific types (TeamData, TeamMemberData)
- **`statistics.ts`** - Statistics and aggregated data types (PlayerStats, TeamStats)
- **`index.ts`** - Central re-export for all types

#### `/pages` - Page Components
Top-level page components and their styles:
- **`Home.tsx`** - Home/bracket page
- **`Scoreboard.tsx`** - Leaderboard and statistics page
- **`Teams.tsx`** - Teams listing page
- **`Profile.tsx`** - User profile page
- **`About.tsx`** - About page
- **`AuthCallback.tsx`** - OAuth callback handler
- **`styles/`** - Page-specific styles

#### `/components` - Reusable Components
- **`auth/`** - Authentication components
- **`nav/`** - Navigation components
- **`modals/`** - Modal components
- **`Players/`** - Player-related components
- **`Teams/`** - Team-related components
- **`Profile/`** - Profile components

#### `/services` - Business Logic Services
Encapsulates complex logic and calculations:
- **`authService.ts`** - Authentication operations (signup, signin, signout)
- **`statisticsService.ts`** - Player/team statistics calculations
- **`index.ts`** - Service exports

#### `/utils` - Utility Functions
Helper functions for common operations:
- **`formatters.ts`** - Data formatting utilities (capitalize, team names, medals)
- **`teamData.ts`** - Team data loading utilities
- **`passwordValidator.ts`** - Password validation
- **`index.ts`** - Utility exports

#### `/hooks` - Custom React Hooks
- **`queries/`** - Query and data fetching hooks
  - `useSupabaseData.ts` - Supabase data fetching
  - `usePlayerQueries.ts` - Player-specific queries

#### `/context` - React Context
- **`UserContext.tsx`** - User authentication context

#### `/constants` - Application Constants
- **`index.ts`** - Rank points, labels, and sorting order

#### `/data` - Static Data
- **`teamData.ts`** - Team data compilation and indexing

#### `/scripts` - Utility Scripts
- **`fillTournament.ts`** - Tournament data population
- **`runTournament.ts`** - Tournament execution logic

## Design Patterns

### Services Layer
Business logic is abstracted into services for reusability and testability:
```typescript
// Example: Statistics calculation
import { calculatePlayerStats } from '../services/statisticsService';

const stats = calculatePlayerStats(players, teams, matches);
```

### Utilities Layer
Common formatting and helper functions:
```typescript
// Example: Data formatting
import { formatTeamName, getRankDisplay } from '../utils/formatters';

const display = formatTeamName(teamName);
const medal = getRankDisplay(index);
```

### Type Organization
Types are organized by domain rather than by location, making imports clearer:
```typescript
import type { Player, Team, Match } from '../types/domain';
import type { PlayerStats, TeamStats } from '../types/statistics';
import type { TeamData } from '../types/team';
```

## Key Principles

1. **Separation of Concerns** - Business logic in services, UI in components
2. **Modularity** - Each service/utility has a single responsibility
3. **Type Safety** - Comprehensive TypeScript types organized logically
4. **Reusability** - Common functions extracted to services/utils
5. **Maintainability** - Clear file organization aids future development

## Import Guidelines

### Services
```typescript
import { calculatePlayerStats } from '../services/statisticsService';
```

### Utilities
```typescript
import { formatTeamName } from '../utils/formatters';
```

### Types
```typescript
import type { Player, Team, Match } from '../types';
import type { PlayerStats, TeamStats } from '../types';
```
