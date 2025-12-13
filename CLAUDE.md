# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Node.js/Express blog system with MySQL database. The codebase is currently in a migration phase - the original application files have been removed, and a new comprehensive database schema has been designed but not yet implemented in code.

**Technology Stack:**
- Express.js web framework
- EJS templating engine
- MySQL database (with connection pooling)
- Markdown rendering (marked library)
- Dependencies: axios, moment, uuid

## Database Architecture

### Current State
The project is transitioning from a legacy single-table design (`xek_article`) to a new normalized 11-table schema.

### New Database Schema (blog_database_schema.sql)

**Core Tables:**
1. `users` - User accounts with bcrypt password hashing, email verification, status management
2. `roles` - Role definitions (admin, editor, author, subscriber)
3. `user_roles` - Many-to-many user-role relationships
4. `categories` - Hierarchical article categories (supports parent/child)
5. `articles` - Main content table with SEO fields, view counts, status workflow
6. `tags` - Article tags
7. `article_tags` - Many-to-many article-tag relationships
8. `comments` - Hierarchical comments supporting both registered and anonymous users
9. `article_likes` - Article like tracking (prevents duplicate likes)
10. `comment_likes` - Comment like tracking
11. `media` - File upload metadata (images, documents)

**Article Status Workflow:**
- `draft` - Unpublished content
- `published` - Live articles
- `archived` - Removed from public view

**Comment Status:**
- `pending` - Awaiting moderation
- `approved` - Visible to public
- `spam` - Flagged as spam
- `trash` - Soft deleted

### Database Connection

Connection details are in `db.js` (legacy) and use environment variables:

```javascript
DB_HOST=rm-bp1r11zh6j1nnf09l1o.mysql.rds.aliyuncs.com
DB_USER=xek
DB_PASSWORD=<your_password>
DB_NAME=xek
```

**Connection Pattern:**
- Uses `mysql` package with connection pooling (10 connections)
- Keep-alive query runs every 5 minutes
- Current implementation has issues: query() function references `client` which may not be properly initialized

## Code Architecture (Legacy - Removed)

The original codebase used a file-based routing pattern:

**Routing System:**
- `router.js` auto-discovers controllers in `controllers/view/` directory
- File names become route paths (e.g., `index.js` → `/`, `article/:id.html.js` → `/article/:id.html`)
- Recursive directory scanning for nested routes

**Request Context:**
- Database connection attached to `req.self.db`
- Shared state in `req.self` object

**Controllers:**
- Each controller exports a single request handler function
- Direct SQL queries using `db.query(sql, params, callback)`
- EJS templates rendered from `template/` directory

**Server Startup:**
- Entry point: `bin/www`
- Start script: `./start.sh` (Linux/Mac) or `node ./bin/www` (Windows)
- Restart script: `./restart.sh` (Linux)

## Database Migration Notes

When implementing the new schema:

1. **Password Hashing:** Use bcrypt for user passwords (not implemented in legacy code)
2. **Prepared Statements:** Legacy code uses parameterized queries but needs security review
3. **Foreign Key Cascading:** Schema includes CASCADE rules - ensure proper handling
4. **Full-Text Search:** `articles` table has FULLTEXT index on title, content, excerpt
5. **Default Data:** Schema includes default roles, categories, and tags
6. **Performance:** Counter cache fields (view_count, like_count, comment_count) must be updated atomically

## Security Considerations

1. **SQL Injection:** Always use parameterized queries (current pattern: `db.query(sql, [params], callback)`)
2. **Password Storage:** Implement bcrypt hashing (not in original code)
3. **Role-Based Access Control:** Implement RBAC using roles and user_roles tables
4. **Comment Moderation:** Use status field to prevent spam
5. **Environment Variables:** Never commit DB_PASSWORD to git

## Installation

```bash
npm install
```

Set `DB_PASSWORD` environment variable, then:

```bash
# Linux/Mac
./start.sh

# Windows
node ./bin/www
```

To apply the new database schema:

```bash
mysql -h [host] -u [username] -p [database] < blog_database_schema.sql
```

See `DATABASE_README.md` for detailed schema documentation.
