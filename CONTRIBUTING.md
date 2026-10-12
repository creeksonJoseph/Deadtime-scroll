# Contributing to DeadTime

Thank you for your interest in contributing to DeadTime! We welcome community contributions to help revive abandoned open-source projects.

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (or 16+)
- npm or yarn
- Git

### 2. Fork & Clone
```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/Deadtime-scroll.git
cd Deadtime-scroll

# 2. Add upstream remote
git remote add upstream https://github.com/creeksonjoseph/Deadtime-scroll.git

# 3. Create a feature branch
git checkout -b feature/your-feature-name
```

### 3. Install & Run
```bash
npm install
cp .env.example .env
npm run dev
```

---

## Code Standards & Guidelines

- **TypeScript Strict Mode**: Maintain strict typing; avoid `any` wherever possible.
- **Component Architecture**: Keep UI components modular, reusable, and cleanly separated.
- **Styling**: Adhere to the design system outlined in [`docs/design-system.md`](docs/design-system.md) (Zero border radius, cyberpunk palette).
- **Linting & Formatting**: Ensure code adheres to ESLint rules:
  ```bash
  npm run lint
  ```
- **Build Verification**: Ensure the production build succeeds before opening a PR:
  ```bash
  npm run build
  ```

---

## Pull Request Process

1. Commit your changes with clear, descriptive commit messages.
2. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request against the `main` branch.
4. Describe the changes introduced, any related issues, and provide screenshots or videos for UI updates.
