# DeadTime - Revive What Was Lost

DeadTime is a platform for reviving abandoned projects. Built with React, TypeScript, TailwindCSS, and featuring a dark cyberpunk aesthetic with neon green accents.

## Features

- **Global Navigation**: Persistent header and sidebar across all pages
  - Header with wallet connection button and user avatar
  - Collapsible sidebar with navigation menu
  - Mobile-responsive hamburger menu
- **Home Page**: Landing page with neon glow animation
- **Project List**: Browse abandoned projects with search and category filters
- **Project Detail**: View detailed information about projects and submit comments
- **Revival List**: See all revivals for a specific project
- **Revival Detail**: View detailed information about a specific revival and bless it
- **User Profile**: Display user stats, revivals, and NFT badges
- **Leaderboard**: Community rankings by blessings and badges
- **Chat**: Real-time messaging interface

## Navigation Menu

The sidebar includes the following actions:
- Home
- Projects
- Submit Project
- My Revivals
- Messages
- Account
- Logout/Connect Wallet

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router DOM
- TailwindCSS
- Lucide React (icons)
- Playfair Display font

## Design Theme

- **Colors**: Dark zinc background (#000000) with neon green accents (#00FF84)
- **Font**: Playfair Display
- **Style**: Modern cyberpunk aesthetic with zero border radius
- **Effects**: Neon glow text shadows and grid background

## Getting Started

### Prerequisites

- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Header.tsx                # Global header with wallet connection
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── Layout.tsx                # Layout wrapper with header & sidebar
├── pages/
│   ├── HomePage.tsx              # Landing page with hero section
│   ├── ProjectListPage.tsx       # Browse projects with filters
│   ├── ProjectDetailPage.tsx     # Individual project details
│   ├── RevivalListPage.tsx       # List of revivals for a project
│   ├── RevivalDetailPage.tsx     # Individual revival details
│   ├── UserProfilePage.tsx       # User profile with stats and badges
│   ├── LeaderboardPage.tsx       # Community leaderboard
│   └── ChatPage.tsx              # Messaging interface
├── App.tsx                       # Main app with routing
├── main.tsx                      # Entry point
└── index.css                     # Global styles and custom CSS
```

## Available Routes

- `/` - Home page
- `/projects` - Project list
- `/projects/:projectId` - Project detail
- `/projects/:projectId/revivals` - Revival list
- `/projects/:projectId/revivals/:revivalId` - Revival detail
- `/profile` - User profile
- `/leaderboard` - Community leaderboard
- `/chat` - Chat interface

## Customization

### Colors

Update colors in `tailwind.config.js`:

```js
colors: {
  primary: '#00ff90',
  'background-dark': '#000000',
  'zinc-gray': '#71717a',
  'neon-green': '#00ff90',
}
```

### Fonts

Change font in `tailwind.config.js` and `src/index.css`:

```js
fontFamily: {
  display: ['Playfair Display', 'serif'],
}
```

## Development Notes

- All components use zero border radius for a sharp, modern look
- Images are loaded from Googleusercontent (replace with your own assets)
- Mock data is used throughout for demonstration purposes
- Responsive design implemented with Tailwind breakpoints

## Future Enhancements

- Integrate with blockchain (Scroll zkEVM)
- Add Supabase backend for data persistence
- Implement Web3 wallet connection
- Add real-time chat functionality
- Integrate IPFS for content storage
- Add NFT minting functionality

## License

MIT
