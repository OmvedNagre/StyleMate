# StyleMate

A personal smart wardrobe assistant for iOS and Android, built with JavaScript, React Native, and Expo Router.

## Current build

Phase 2 photo wardrobe preview: take a photo or select one from the gallery, enter attributes manually, then view, edit, filter, or remove the piece. Photos are copied from picker/cache locations into the app's private documents directory before the item is added. Failed copies do not add records. Replacing or deleting a photo only cleans up files owned by StyleMate.

**Current limitation:** clothing records, favorites, and history are still in memory and reset when the app restarts. Photo files themselves use persistent storage, but cannot be rediscovered through the UI after their records reset. Until Phase 3 adds SQLite, use this as a development preview, not your only wardrobe record. Unreferenced files from previous sessions can remain in the app sandbox; uninstalling clears them.

Five clearly labeled sample illustrations remain for exploring the UI. Profile's sample reset/hide controls preserve user photo pieces in the current session. Discover still shows a fixed example with an illustrative score, not computed recommendations.

The planned product keeps clothing photos and SQLite data on-device, uses manually entered attributes and weather, and suggests outfits with deterministic rules. No backend, account, or AI service is required.

## Setup

Use Node.js 22 LTS and npm. From this directory:

```sh
npm ci
npm start
```

The project uses Expo SDK 58. Use an Expo Go release compatible with that SDK; see the [Expo environment guide](https://docs.expo.dev/get-started/set-up-your-environment/). Image Picker and FileSystem are included in compatible Expo Go releases. Rebuild a development/standalone binary after changing native permission configuration. No credentials or environment variables are needed.

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
- `src/demo/`: sample data and temporary wardrobe/session state, pending SQLite integration.
- `src/services/imageService.js`: native pickers, managed photo copies, and guarded deletion.
- `tests/`: component and interaction tests using Jest Expo and React Native Testing Library.
- `src/constants/theme.js`: color, spacing, typography, and radius tokens.
- `docs/StyleMate_Codex_Handoff.md`: supplied product brief and phased scope.
- `PROJECT_STATUS.md`: actual checks, limitations, and next steps.

Camera permission is requested only after tapping **Take Photo**. Denial offers Settings and gallery recovery. The image-only system gallery picker grants selected-file access without requesting broad library permission. No location, contacts, notifications, or microphone permission is needed; the Image Picker plugin disables microphone permission. Photos are never uploaded. See [Image Picker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/) and [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/) for SDK behavior.

## Manual UI check

On both iOS and Android, launch the app, tap each of the four tabs, follow each screen's navigation link, check safe areas, then increase text size and verify content scrolls. Record results in `PROJECT_STATUS.md`; simulator and physical-device checks are separate.

Try this prototype flow:

1. Filter Wardrobe by Footwear, then Accessory to see an empty category.
2. Add a piece; submit empty fields to see validation, then take or select a photo and enter its name.
3. Open its details, edit it, then try removal (with confirmation).
4. Choose occasion/weather/style in Discover and open the fixed preview.
5. Save the demo outfit, mark it worn, then inspect Saved Outfits and History from Profile.
6. Remove a sample item and verify saved outfits explain its absence while history retains its snapshot.
7. In Profile, restore the collection, hide sample pieces, and inspect loading/error previews.
8. On a small device and with enlarged text, verify wrapping, scrolling, and keyboard reachability on the form.

The automated suite checks component behavior with navigation mocked. It does not replace real iOS/Android navigation, rendering, or keyboard verification. Those checks are still pending.

Phase 2 device checklist (not yet executed): test capture on real iOS/Android devices, deny/revoke permission, use limited photo access, cancel each picker, replace a photo, delete an item, test a missing photo and storage failure, and confirm the source gallery image survives deletion. Verify large images and small-screen keyboard behavior. Record actual device results separately from mocked tests.

Next: Phase 3 — SQLite persistence for wardrobe, outfits, favorites, and history.
