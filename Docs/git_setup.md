# Git Setup Guide

This guide explains how to set up Git version control for the Threadbox project.

## Initial Git Setup

### 1. Initialize Git Repository (if not already done)

```bash
cd /path/to/Threadbox

# Check if git is already initialized
git status

# If not initialized, run:
git init
```

### 2. Configure Git User (if not already configured globally)

```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 3. Create .gitignore

The project already includes a `.gitignore` file that excludes:
- `node_modules/`
- Environment files (`.env`, `.env.local`)
- Build artifacts (`.next/`, `dist/`)
- IDE files
- Log files
- Google Cloud service account keys

### 4. Create Initial Commit

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Threadbox application"
```

## Connect to Remote Repository

### Option 1: GitHub

1. **Create GitHub Repository**
   - Go to [GitHub](https://github.com)
   - Click **New repository**
   - Name it `threadbox` (or your preferred name)
   - **Do NOT** initialize with README, .gitignore, or license
   - Click **Create repository**

2. **Add Remote and Push**
   ```bash
   # Add remote repository
   git remote add origin https://github.com/YOUR_USERNAME/threadbox.git
   
   # Rename branch to main (if needed)
   git branch -M main
   
   # Push to GitHub
   git push -u origin main
   ```

### Option 2: GitLab

1. **Create GitLab Repository**
   - Go to [GitLab](https://gitlab.com)
   - Create a new project
   - Copy the repository URL

2. **Add Remote and Push**
   ```bash
   git remote add origin https://gitlab.com/YOUR_USERNAME/threadbox.git
   git branch -M main
   git push -u origin main
   ```

### Option 3: Bitbucket

1. **Create Bitbucket Repository**
   - Go to [Bitbucket](https://bitbucket.org)
   - Create a new repository
   - Copy the repository URL

2. **Add Remote and Push**
   ```bash
   git remote add origin https://bitbucket.org/YOUR_USERNAME/threadbox.git
   git branch -M main
   git push -u origin main
   ```

## Branch Strategy

### Recommended Branch Structure

```
main (production)
  └── develop (development)
      └── feature/feature-name (feature branches)
      └── bugfix/bug-name (bug fix branches)
      └── hotfix/hotfix-name (hotfix branches)
```

### Create Development Branch

```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch to remote
git push -u origin develop
```

### Create Feature Branch

```bash
# Switch to develop
git checkout develop

# Pull latest changes
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add: your feature description"

# Push feature branch
git push -u origin feature/your-feature-name
```

## Common Git Workflows

### Daily Workflow

```bash
# Start of day: Pull latest changes
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/my-feature

# Make changes, then commit
git add .
git commit -m "Add: feature description"

# Push to remote
git push origin feature/my-feature
```

### Merging Feature to Develop

```bash
# Switch to develop
git checkout develop

# Pull latest changes
git pull origin develop

# Merge feature branch
git merge feature/my-feature

# Push to remote
git push origin develop

# Delete local feature branch (optional)
git branch -d feature/my-feature

# Delete remote feature branch (optional)
git push origin --delete feature/my-feature
```

### Merging Develop to Main (Production)

```bash
# Switch to main
git checkout main

# Pull latest changes
git pull origin main

# Merge develop
git merge develop

# Push to main (triggers production deployment)
git push origin main

# Tag the release (optional)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Git Best Practices

### Commit Messages

Use clear, descriptive commit messages:

```bash
# Good commit messages
git commit -m "Add: user authentication with JWT"
git commit -m "Fix: email ingestion timeout issue"
git commit -m "Update: Carbon Design System components"
git commit -m "Refactor: API client error handling"

# Bad commit messages (avoid)
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

### Commit Message Format

```
Type: Brief description

Optional detailed description explaining what and why.
```

**Types:**
- `Add:` - New feature
- `Fix:` - Bug fix
- `Update:` - Update existing feature
- `Refactor:` - Code refactoring
- `Remove:` - Remove feature or code
- `Docs:` - Documentation changes
- `Style:` - Code style changes (formatting, etc.)
- `Test:` - Adding or updating tests
- `Chore:` - Maintenance tasks

### Before Committing

1. **Check what you're committing:**
   ```bash
   git status
   git diff
   ```

2. **Ensure tests pass:**
   ```bash
   # Backend
   cd backend
   npm test
   
   # Frontend
   cd frontend
   npm test
   ```

3. **Check for sensitive data:**
   - No API keys
   - No passwords
   - No service account keys
   - No `.env` files

### Staging Changes

```bash
# Stage specific files
git add path/to/file.ts

# Stage all changes
git add .

# Stage with interactive mode
git add -p
```

## Handling Merge Conflicts

### When Conflicts Occur

```bash
# Pull latest changes
git pull origin develop

# If conflicts occur, Git will mark them
# Open conflicted files and resolve manually
# Look for conflict markers:
# <<<<<<< HEAD
# your changes
# =======
# incoming changes
# >>>>>>> branch-name

# After resolving conflicts:
git add .
git commit -m "Merge: resolve conflicts"
```

## Useful Git Commands

### Viewing History

```bash
# View commit history
git log

# View commit history (one line per commit)
git log --oneline

# View changes in a file
git log -p path/to/file.ts

# View who changed what
git blame path/to/file.ts
```

### Undoing Changes

```bash
# Undo changes in working directory (not staged)
git checkout -- path/to/file.ts

# Unstage changes
git reset HEAD path/to/file.ts

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Branch Management

```bash
# List all branches
git branch -a

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Rename branch
git branch -m old-name new-name
```

### Tagging Releases

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tags to remote
git push origin v1.0.0

# List all tags
git tag

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## CI/CD Integration

Once Git is set up, the CI/CD pipeline (GitHub Actions) will automatically:
- Run tests on push/PR
- Build Docker images
- Deploy to Cloud Run (on push to main)

See [GCP Deployment Guide](./gcp_deployment.md) for details.

## Troubleshooting

### Authentication Issues

```bash
# If using HTTPS and getting authentication errors
# Switch to SSH or use Personal Access Token

# For SSH:
git remote set-url origin git@github.com:USERNAME/threadbox.git

# For HTTPS with token:
# Use GitHub Personal Access Token as password
```

### Large Files

If you accidentally committed large files:

```bash
# Remove from Git history (use with caution)
git filter-branch --tree-filter 'rm -f path/to/large-file' HEAD

# Or use git-filter-repo (recommended)
# Install: pip install git-filter-repo
git filter-repo --path path/to/large-file --invert-paths
```

### Recovering Lost Commits

```bash
# View reflog (recent actions)
git reflog

# Recover lost commit
git checkout COMMIT_HASH
git checkout -b recovery-branch
```

## Next Steps

1. Set up CI/CD pipeline (see [GCP Deployment Guide](./gcp_deployment.md))
2. Configure branch protection rules in GitHub
3. Set up code review process
4. Configure pre-commit hooks (optional)

