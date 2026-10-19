# Johnly-math — English Lesson + Personal Dashboard

This release updates the existing static Johnly-math project. It contains the full site source and should be deployed as one folder.

## Included features

- Grade 10/11/12 course directory with expandable course folders.
- English edition of **Grade 10 · Sets and Logic · Introduction to Sets 1**.
- A narrative lesson set in the “Archive of Number Islands,” with illustrated circular set diagrams, guided sections, and 24 interactive multiple-choice checks.
- Six typed-response examples. The teacher's worked solution remains hidden until the learner enters an accepted answer. Incorrect attempts provide a hint and can be retried.
- Green outlines and progress feedback for correctly answered questions.
- A **Personal Dashboard** button at the bottom of the left sidebar, with three intentionally unpopulated sections: Personal Courses, Honours, and Challenge Cup.
- Per-username lesson progress saved automatically in browser local storage and restored after a reload or a later login in the same browser/origin.

## Files

```text
index.html
main.js
auth.js
curriculum.js
progress.js
lessons/
  sets-intro-1.js
README.md
```

## Deploy

1. Upload all files and the `lessons` folder together to the root of your static site.
2. Keep the relative paths and folder name exactly as shown.
3. Make sure the host publishes `index.html` from the same folder as `main.js`.
4. After deploying, open the site over HTTPS and hard-refresh once (`Ctrl + Shift + R` on Windows) if an older build is cached.

The HTML script URL and ES-module imports use the build identifier `20261018-en-dashboard-progress-v2` to avoid reusing an older browser cache.

## Progress storage and account limitation

The current project is a static prototype. Account records and lesson progress are stored in this browser's `localStorage`; progress is namespaced by the normalized username, so different usernames on the same browser do not share progress. It survives refreshes and signing out/in on the same browser and site origin.

**This is not cloud account storage.** A user's progress does not automatically follow them to another device, another browser profile, or another deployed domain. That requires a real backend/database and server-side authentication. The existing prototype login also stores accounts locally in the browser, so it should not be treated as production-grade security. Do not reuse a password from another service.

## Checks performed

- JavaScript syntax checks passed for `main.js`, `auth.js`, `curriculum.js`, `progress.js`, and `lessons/sets-intro-1.js`.
- HTML parser check reported no duplicate IDs or unbalanced tags.
- Cross-file module paths, dashboard IDs, and lesson IDs were checked.
- Browser interaction checks should be rerun after deployment because static hosts can be configured differently.
