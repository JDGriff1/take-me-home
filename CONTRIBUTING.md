# Contributing to Take Home Pay Calculator

Thank you for your interest in contributing to the Take Home Pay Calculator project!

## Development Workflow

### Getting Started

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Install dependencies: `npm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`

### Running the Project

```bash
# Development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type checking (if applicable)
npm run typecheck
```

### Code Style & Conventions

- Follow existing code patterns in the repository
- Use TypeScript for all new code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages using conventional commit format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

### Before Committing

Always run these checks before committing:

```bash
npm run lint
npm test  # when tests are added
```

### Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if needed
3. Test your changes thoroughly
4. Create a pull request with a clear description of changes
5. Reference any related issues

### Branch Naming Convention

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation updates
- `refactor/description` - for code refactoring

## Testing

When the testing framework is set up:
- Write tests for new features
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## Questions?

Feel free to open an issue for questions or clarifications.

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
