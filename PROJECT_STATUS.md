# StyleMate Project Status

## Current phase
Phase 2 — Clothing photo capture and wardrobe CRUD

## Overall status
Phase 2 implementation and automated checks completed. Native camera/gallery, filesystem, permissions and visual acceptance remain pending physical-device testing. Phase 3 has not started. Earlier native navigation/keyboard checks also remain open.

## Completed
- [x] Installed SDK-compatible Expo Image Picker and FileSystem.
- [x] Separate Take Photo and Choose from Gallery actions with preview.
- [x] Camera permission requested on action; permanent denial avoids repeated requests, offers Settings. Gallery uses the image-only system picker without broad library access.
- [x] Cancellation leaves the current selection unchanged; picker errors are visible.
- [x] Manual clothing attributes and validation; loading/duplicate-submit guards.
- [x] Persistent image copying to private documents/wardrobe, unique file names and extension preservation.
- [x] A failed copy does not insert a record; partial-copy cleanup is attempted.
- [x] Clothing view/edit/delete uses temporary in-memory records as allowed by Phase 2.
- [x] Replacement copies the new photo before removing the old one; failed old-file cleanup retains the previous record and attempts new-copy cleanup.
- [x] Confirmed deletion removes only service-owned image paths; absent files are tolerated and deletion failures retain the record.
- [x] Photo component used in cards, details, previews and history, with unavailable-image fallback.
- [x] Sample reset/hide preserves user photo items in the current session, including sample items updated with real photos.
- [x] No AI, backend, location service, or recognition added. Microphone permission disabled in plugin config.
- [ ] Native/device acceptance for camera, gallery, denial, persistence, image display and small-screen layouts.

## Verification performed
2026-11-22:
- `npm test -- --watchman=false`: 30 tests passed across 2 suites. Existing UI tests plus picker cancellation, camera denial/permission requests, copy failure/retry, extension preservation, safe deletion boundaries and missing-file handling.
- Filesystem/picker tests mock native modules; they verify application control flow and guards, not actual device behavior.
- `npm run lint`: passed.
- `npm run typecheck`: passed; application remains JavaScript.
- `npm run export:mobile`: iOS and Android Hermes exports passed.
- `npx expo install --check`: dependencies up to date.
- `npx --yes expo-doctor`: 20/20 checks passed.
- `git diff --check`: passed; reviewed changed source/config and documentation.
- Platforms tested: component mocks and mobile bundlers only. No simulator/emulator/physical device.

## Known issues
- Full Xcode/simctl and Android SDK/adb remain unavailable. Device verification cannot be claimed.
- Clothing metadata is intentionally in memory for this phase and resets on restart. Images live in persistent documents storage but become unreferenced after that reset; the UI cannot restore them yet. SQLite and restart recovery are Phase 3.
- No destructive startup cleanup of unreferenced photos. Such files can remain until app uninstall; this is a development preview.
- History text snapshots survive deletion within the session, but deleted/replaced image files show the image-unavailable fallback.
- Android activity termination during picking is not recovered into a draft; users may need to select again.
- Fixed sample outfit scores/reasons are still illustrative, not computed from wardrobe edits or preferences.
- Dependency installation reports 22 moderate advisories, unchanged from Phase 1. No forced SDK downgrade.

## Decisions / assumptions
- Follow only Phase 2; use the handoff's explicit option for in-memory records rather than prematurely implementing Phase 3.
- Preserve sample illustrations for existing demo items; new clothing requires an actual photo.
- Use the installed SDK's File/Directory APIs and the platform image-only picker; do not upload photos or request broad permissions unnecessarily.
- Keep all photo side effects in imageService and session CRUD coordination, outside presentation components.
- User authorized automatic commits and pushes after each phase. Delivery branch remains codex/project-foundation, tracking origin.

## Next action
Run the README's Phase 2 checklist on physical iOS and Android devices. Next implementation phase is Phase 3 — SQLite initialization/migrations, parameterized CRUD, durable wardrobe records, favorites/history persistence, and coordinated image/record failure handling.
