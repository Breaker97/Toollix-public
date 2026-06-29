# Contributing to Toollix

First off, thank you for considering contributing to Toollix! It is people like you who make Toollix such a great utility for everyone.

Here are a few guidelines to follow when contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to the project maintainers.

## 🐛 Reporting Bugs

If you find a bug:
1. **Search existing issues** to make sure it hasn't already been reported.
2. If it's a new issue, open a new bug report on GitHub.
3. Use a clear and descriptive title.
4. Describe the exact steps to reproduce the behavior, what you expected to happen, and what actually happened. Include screenshots if applicable.

## 💡 Suggesting Enhancements or New Tools

We love adding new tools! If you have an idea:
1. Open a feature request issue on GitHub.
2. Explain the utility of the tool and who it is for.
3. List any external libraries or packages that would be required.

## 🛠️ Local Development Setup

To work on the codebase:
1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/toollix.io.git
   cd toollix.io
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in the connection strings for MongoDB and Redis in .env.local
   ```
4. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

## 📐 Coding Standards & Guidelines

* **Framework Rules**: We use Next.js with App Router. Follow Next.js guidelines for server and client component placement.
* **Styling**: We primarily use TailwindCSS. Avoid inline styles where possible.
* **Component Design**: Keep your custom tools encapsulated within the `app/tools` directory.
* **TypeScript**: Ensure all new files are written in TypeScript and linted.
* **Pull Request Guidelines**:
  * Create a branch from `main` (e.g., `feature/my-cool-tool` or `fix/issue-description`).
  * Ensure the app builds successfully locally (`npm run build`) before pushing.
  * Keep pull requests small and focused on a single change/tool.
  * Update documentation or the README if your contribution adds a significant feature or tool.

Thank you for your support!
