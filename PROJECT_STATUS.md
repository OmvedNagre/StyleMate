# StyleMate Project Status

## Current phase
Phase 3 — SQLite persistence

## Overall status
Phase 3 implementation and automated checks completed. Durable records verified against a real SQLite file on the host, including close/reopen. Native iOS/Android database initialization, photo persistence and restart acceptance remain pending device verification. Phase 4 has not started.

## Completed
- [x] SDK-compatible Expo SQLite installed; shared connection initialization with retry on failure.
- [x] Version 1 schema, WAL, foreign keys, idempotent migration entry point, explicit rejection of newer schemas without resetting data.
- [x] Parameterized clothing CRUD, outfit/favorite storage, ordered history snapshots and default style persistence.
- [x] Exclusive transactions for multi-record changes; state mutations serialized and UI state refreshed after successful commits.
- [x] Startup loading/error/retry UI; save/favorite/profile errors remain visible and retryable.
- [x] New photos copied before SQL commits; failed saves attempt to remove only the new copy and preserve previous data.
- [x] Old photo deletion queued durably in the same transaction as record replacement/deletion. Failed file cleanup retries at startup/next mutation without undoing a committed record change.
- [x] Fresh installs start empty. Sample pieces are opt-in, persisted and clearly labeled; adding missing samples never overwrites existing records.
- [x] Saved outfits handle deleted clothing; history retains item snapshots and text even if an image is unavailable.
- [x] Updated README with storage design, failure behavior, verification limits and native checklist.
- [ ] iOS and Android restart/photo/database checks on actual runtimes.

## Verification performed
2026-11-22:
- `npm test -- --watchman=false`: 39 tests passed across 3 suites.
- 6 database integration tests use real host SQLite files via Node's SQLite adapter: repeated initialization, future-schema rejection, foreign keys, parameterized special-character names, close/reopen persistence for clothing/favorites/history/preferences, replacement, deletion, cleanup retry, transaction rollback, history ordering/deduplication and sample preservation.
- UI tests additionally cover startup failure/retry, database-write failure/new-copy cleanup and favorite failure/retry.
- Native filesystem and image-picker APIs remain mocked in tests; host SQLite checks do not establish Expo native runtime behavior.
- `npm run typecheck`: passed; all application logic remains JavaScript.
- `npm run lint`: passed.
- `npm run export:mobile`: iOS and Android Hermes exports passed.
- `npx expo install --check`: dependencies up to date.
- `npx --yes expo-doctor`: 20/20 checks passed.
- `git diff --check`: passed; reviewed source, configuration and persistence integration.

## Known issues
- No full Xcode/simctl or Android SDK/adb available. Native camera/gallery, database, keyboard, safe-area, image loading and restart checks from earlier phases remain pending.
- Phase 2 metadata was never durable and cannot be restored after an earlier restart. Its orphaned photos are left untouched.
- A crash between copying a new photo and committing its record, or a failed rollback cleanup, can leave an unreferenced file. No broad destructive cleanup is attempted.
- Favorites/results still use one explicitly labeled fixed sample outfit. Multi-outfit recommendation behavior is Phase 4, and the full save/wear feedback workflow is Phase 5.
- The mark-worn duplicate guard lasts for the current app session; history itself is persistent. A new app session permits a new wear entry.
- Historical text survives photo deletion, but removed/replaced photos use the missing-image fallback.
- Android picker activity termination recovery remains pending as recorded in Phase 2.
- Dependency installation reports 22 moderate advisories, unchanged. No forced SDK downgrade applied.

## Decisions / assumptions
- Use text primary keys to preserve existing stable clothing/demo IDs; retain explicit attribute columns rather than replacing them with a single JSON blob.
- Store outfit and history display snapshots as JSON; this supports the current fixed preview without introducing the Phase 4 engine.
- Keep the provider's historical DemoContext name to avoid unrelated route churn; its state now comes from SQLite.
- Do not seed clothing silently. Users can explicitly add labeled sample pieces from Profile. Hiding samples removes only illustration records, never photo records; favorites/history remain.
- Add a small cleanup table because SQLite and the filesystem cannot share an atomic transaction. Prefer retryable extra files over missing photos for committed clothing records.
- Automatic phase commit/push is authorized; deliver on codex/project-foundation tracking origin.

## Next action
Run the README's Phase 3 device checklist on iOS and Android. Next implementation phase: Phase 4 — deterministic candidate generation, occasion/color/weather/style scoring, recent-repetition handling, explanations, and actual Discover results.
