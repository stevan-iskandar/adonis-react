# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Session login with an optional 30-day "remember me".** There is no
  public signup: an admin creates users, and the seeder creates the first
  admin.
- **User management over `/api/user`** — show, options, create, update,
  soft delete and change password. Creating a user with the email of a
  deleted one restores that row instead of failing on the unique email.
- **Role-based access on every `/api` route.** `ADMIN` holds every
  permission and `STAFF` the asset ones. The codes are read once at login,
  so a change to a user's roles takes effect at their next login.
- **The panel's shell:** login page, main layout with a side menu that
  shows only what the user may open, and toasts for flash messages.
- **CI on GitHub Actions** for every push to `main`.
- **The panel's shell:** a sign-in page with an optional "Remember me", and
  a main layout with a collapsible side menu that shows only what the user
  may open, keeps the current page's entry selected, and asks before
  signing out. Flash messages appear as toasts.

