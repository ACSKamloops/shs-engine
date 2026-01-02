# Contributing to Pukaist Engine

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

```bash
# Clone and setup
git clone <repo> && cd pukaist-engine
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"  # or: make install

# Start development environment
make dev

# Run checks before committing
make check  # runs lint + test
```

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear, structured commit history.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring (no feature/fix) |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(api): add batch upload endpoint
fix(worker): handle empty PDF files gracefully
docs(readme): update deployment instructions
refactor(admin): split routes into submodules
test(geo): add AOI boundary validation tests
```

### Breaking Changes

Add `!` after the type or include `BREAKING CHANGE:` in the footer:

```bash
feat(api)!: change upload response format

BREAKING CHANGE: Upload response now returns job_id instead of task_id
```

## Code Style

- **Python**: Use [Ruff](https://github.com/astral-sh/ruff) for linting and formatting
- **TypeScript**: Use Prettier for formatting  
- **Line length**: 100 characters
- **Imports**: Organize with `isort` (via Ruff)

## Pull Request Checklist

- [ ] All tests pass (`make test`)
- [ ] Code is formatted (`make lint` shows no errors)
- [ ] New features have tests
- [ ] Documentation updated if needed
- [ ] Commit messages follow Conventional Commits
- [ ] No secrets or credentials in code

## Running Tests

```bash
# Backend
make test          # Run all tests
make test-cov      # Run with coverage report
make lint          # Check formatting

# Frontend
cd frontend
npm run test:unit  # Unit tests
npm run lint       # ESLint check
npm run test:e2e   # E2E tests (requires running server)
```

## Questions?

Open an issue for questions or discussion about potential contributions.
