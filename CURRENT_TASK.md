# Notes Feature Implementation Plan

## Overview

Implement a notes system for game session management, allowing users to create rich-text notes with tagging and filtering capabilities within the existing game-based tab interface.

## Data Model

### Collections Required

**`gp_notes`**

```js
{
  id: string,
  user: string,           // FK to users
  game: string,           // FK to gp_games
  title: string,
  content: string,        // Rich text HTML
  tags: string[],         // JSON array
  created: datetime,
  updated: datetime
}
```

**`gp_game_metadata`**

```js
{
  id: string,
  user: string,           // FK to users
  game: string,           // FK to gp_games
  tags: string[],         // All available tags for this game
  created: datetime,
  updated: datetime
}
```

## Feature Set

### Core Features

- ✅ **CRUD Operations**: Create, read, update, delete notes
- ✅ **Rich Text Editor**: WYSIWYG editor for note content
- ✅ **Tagging System**: Add/remove tags per note
- ✅ **Tag Management**: Auto-complete from existing game tags
- ✅ **Search & Filter**: Filter by tags, search title/content
- ✅ **Sort Options**: Sort by updated date (most recent first)
- ✅ **Game Context**: Notes scoped to selected game

### UI/UX

- ✅ **Note Cards**: Compact card view showing title, tags, preview, updated date
- ✅ **Full-Screen Dialog**: Rich editing experience for create/edit
- ✅ **Inline Controls**: New note button, search bar, sort controls
- ✅ **Tag Pills**: Visual tag filtering with remove functionality
- ✅ **Mobile Responsive**: Works well on mobile devices

## Implementation Tasks

### 1. Data Layer

- [ ] Create note model/schema with Zod validation
- [ ] Create game metadata model/schema
- [ ] Implement note service functions (CRUD)
- [ ] Implement game metadata service functions
- [ ] Create TanStack Query hooks for notes and metadata

### 2. Components

- [ ] Replace placeholder NotesTab component
- [ ] Build NoteCard component for list view
- [ ] Build NoteForm component with rich text editor
- [ ] Build tag input/management components
- [ ] Build search and filter controls

### 3. State Management

- [ ] Query keys for notes and metadata
- [ ] Mutation hooks with proper invalidation
- [ ] Tag auto-complete logic
- [ ] Search/filter state management

### 4. Integration

- [ ] Wire up full-screen dialog for note creation/editing
- [ ] Integrate with existing game selection flow
- [ ] Handle empty states and loading states
- [ ] Add proper error handling and user feedback

## Technical Decisions

- **Rich Text**: Use WYSIWYG editor (not markdown) for broader usability
- **Tags**: Store as JSON arrays, managed through game metadata collection
- **Architecture**: Separate metadata collection to avoid query invalidation cascades
- **UI Pattern**: Full-screen dialog for editing, compact cards for overview

## Success Criteria

- Users can create, edit, and organize notes per game
- Tagging system provides flexible categorization
- Search and filtering enable quick note retrieval
- Interface remains clean and doesn't overwhelm the existing tab layout
- Performance remains smooth with reasonable note volumes (100+ notes per game)
