# GrindPad

A gamified task management app designed for MMO players who need session management across different characters and games.

## What It Does

- **Tasks**: Daily, weekly, and other task management per game
- **Notes**: Rich text notes with tagging for builds, rotations, guides
- **Resources**: Link repository for external guides and resources
- **Game Management**: Organize content by game with searchable interface

## Tech Stack

- React + TypeScript
- TanStack Router + Query
- Chakra UI
- PocketBase backend (shared across multiple apps)

## Key Features

- Rich text editor with code blocks for rotations/macros
- Tag-based organization across all content types
- Mobile-responsive game selection
- Search and filtering for all content
- Game metadata management

## Development

Standard React development workflow. Uses TanStack Query for data fetching and caching.

## Notes

- Part of a larger platform sharing PocketBase backend
- MVP complete - ready for real-world testing
- See [future feature ideas](./docs/future_feature_ideas.md) for enhancement backlog
- Uses [conventional commits](./docs/conventional_commits.md) for commit messaging
