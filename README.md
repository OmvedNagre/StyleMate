# StyleMate

A personal smart wardrobe assistant for iOS and Android, built with JavaScript, React Native, and Expo Router.

## Problem and features

People can overlook clothes they own or repeat combinations while deciding what to wear. StyleMate combines a photo wardrobe, manual attributes, deterministic outfit suggestions, favorites and wear history in one local app.

## Documentation

- [Architecture and storage](docs/ARCHITECTURE.md)
- [Recommendation rules](docs/RECOMMENDATIONS.md)
- [Demo script and viva answers](docs/DEMO_AND_VIVA.md)
- [Native verification matrix](docs/DEVICE_TEST_MATRIX.md)
- [Project status and limitations](PROJECT_STATUS.md)

## Current build

Implemented features: clothing details, photo references, favorites, wear-history snapshots, and the default style are saved in SQLite on the device. Camera/gallery photos live in private app documents storage. The wardrobe loads saved records at startup and offers Retry if opening storage fails; it never resets the database to recover from an error.

Fresh installs start empty. Add your own clothing, or explicitly add the five labeled sample illustrations from Profile to explore recommendations. Sample controls preserve photo pieces, favorites, and history. Discover now generates up to three actual combinations with rule-based scores and explanations. See [recommendation rules](docs/RECOMMENDATIONS.md).

Database persistence has been tested by closing and reopening a real SQLite file on the development host. Actual iOS/Android restart and image loading are still awaiting device verification. Records from Phase 2 were in memory and cannot be recovered after they were lost; legacy unreferenced photos are not automatically deleted.

The application keeps clothing photos and SQLite data on-device, uses manually entered attributes and weather, and suggests outfits with deterministic rules. No backend, account, or AI service is required.

## Setup

Use Node.js 22.13+ (22 LTS) and npm; database tests use Node’s built-in SQLite module. From this directory:

```sh
npm ci
npm start
```

The project uses Expo SDK 58. Use an Expo Go release compatible with that SDK; see the [Expo environment guide](https://docs.expo.dev/get-started/set-up-your-environment/). Image Picker, FileSystem, and SQLite are included in compatible Expo Go releases. Rebuild a development/standalone binary after changing native permission configuration. No credentials or environment variables are needed.

- **iOS Simulator:** Install full Xcode and a simulator runtime, select Xcode as the active developer directory, then run `npm run ios`.
- **Android Emulator:** Install Android Studio, configure its SDK and an emulator, start that emulator, then run `npm run android`.
- **Physical iOS:** Install compatible Expo Go, put the phone and computer on the same network, run `npm start`, and scan the QR code with Camera.
- **Physical Android:** Install compatible Expo Go and scan the development-server QR code from Expo Go on the same network.
- A standalone/development build is needed if future native dependencies are not included in Expo Go. Development-server connectivity is separate from the eventual installed app's offline operation.

## Checks

```sh
npm test -- --watchman=false
npm run lint
npm run typecheck
npm run check
npm run export:mobile
npx expo-doctor
```

Type checking checks JavaScript without generating files. Mobile export verifies bundles; it does not prove on-device launch or interaction.

## Structure

- `src/app/`: Expo Router layouts and screens, written in JavaScript.
- `src/components/`: shared screen, controls, clothing form/grid/illustrations, outfit card, and UI states.
- `src/demo/`: labeled sample fixtures and the shared SQLite-backed state provider (historical module name).
- `src/services/database.js`: schema versioning, parameterized CRUD, snapshots, and durable photo-cleanup queue.
- `src/services/imageService.js`: native pickers, managed photo copies, and guarded deletion.
- `tests/`: component and interaction tests using Jest Expo and React Native Testing Library.
- `src/constants/theme.js`: color, spacing, typography, and radius tokens.
- `docs/StyleMate_Codex_Handoff.md`: supplied product brief and phased scope.
- `PROJECT_STATUS.md`: actual checks, limitations, and next steps.

Camera permission is requested only after tapping **Take Photo**. Denial offers Settings and gallery recovery. The image-only system gallery picker grants selected-file access without requesting broad library permission. No location, contacts, notifications, or microphone permission is needed; the Image Picker plugin disables microphone permission. Photos are never uploaded. See [Image Picker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/) and [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/) for SDK behavior.

## Manual UI check

On both iOS and Android, launch the app, tap each of the four tabs, follow each screen's navigation link, check safe areas, then increase text size and verify content scrolls. Record results in `PROJECT_STATUS.md`; simulator and physical-device checks are separate.

Try this prototype flow:

1. A fresh install shows an empty wardrobe. In Profile, add sample pieces if desired; filter Wardrobe by Footwear, then Accessory to see an empty category.
2. Add a piece; submit empty fields to see validation, then take or select a photo and enter its name.
3. Open its details, edit it, then try removal (with confirmation).
4. Choose occasion/weather/style in Discover and generate outfits.
5. Save a generated outfit, mark it worn, then inspect Saved Outfits and History from Profile.
6. Remove a sample item and verify saved outfits explain its absence while history retains its snapshot.
7. In Profile, restore the collection, hide sample pieces, and inspect loading/error previews.
8. On a small device and with enlarged text, verify wrapping, scrolling, and keyboard reachability on the form.

The automated suite checks component behavior with navigation mocked and database queries against a real SQLite file through a host adapter. It does not replace real iOS/Android navigation, rendering, or keyboard verification. Those checks are still pending.

Phase 2 device checklist (not yet executed): test capture on real iOS/Android devices, deny/revoke permission, use limited photo access, cancel each picker, replace a photo, delete an item, test a missing photo and storage failure, and confirm the source gallery image survives deletion. Verify large images and small-screen keyboard behavior. Record actual device results separately from mocked tests.

## Local storage and failures

The schema uses `PRAGMA user_version = 1`, WAL, foreign keys and exclusive transactions for operations that change multiple records. User values are parameterized. The tables are:

- `clothing`: stable text ID, manual attributes, photo URI or sample illustration, seasons JSON, and timestamps.
- `outfits`: outfit snapshot JSON and favorite state (generated combinations and legacy samples).
- `outfit_history`: timestamped item snapshots, linked to an outfit with `ON DELETE SET NULL`.
- `settings`: default style.
- `image_cleanup`: old photo URIs waiting for safe deletion.

Photo save order: copy a new photo, commit its record, then remove the old file. Failed database saves attempt to remove only the new copy. Replacements/deletions queue old files in the same transaction as the record change; cleanup failures retry on startup or the next successful mutation. A committed change is not reported as failed merely because later file cleanup fails. Historical text remains available after clothing deletion; deleted photos show a fallback.

A process crash between photo copy and database commit can leave an unreferenced file. The app deliberately avoids a broad filesystem sweep that could remove personal files. Database uninstall/reset is never used as an automatic recovery path.

Phase 3 device checklist: add a real photo, edit its attributes, save the sample outfit and mark it worn, terminate/reopen the app, verify all records/images, replace/delete the photo, reopen again, and verify favorites/history still render. Test SQLite error/retry and storage failures on test devices. These native checks remain pending.

Release acceptance remains pending the Phase 6 native device checks.

## Favorites and wear history

Save or remove each generated outfit independently. Saved cards retain generation-time scores and name missing pieces from their snapshots. Missing pieces disable wear recording; Generate fresh suggestions returns to Discover.

Mark as worn records the current clothing details and time. Previously worn outfits show the last wear date and a Wear again action, including after restart. Another entry requires confirmation. Cancelling adds nothing; in-flight locks prevent duplicate submissions. History remains newest first, retains text after deletion, and influences recommendation ranking.

Phase 6 reliability review: see [native test matrix](docs/DEVICE_TEST_MATRIX.md). Host verification is complete; native acceptance remains pending.

## Screenshots and future scope

No actual app screenshots are included because native visual verification has not been performed. Sample garment illustrations are not screenshots or real clothing photos. AI recognition may be considered only in a separately approved future phase; it is not implemented. There is no cloud backup, login, automatic weather service or analytics.
