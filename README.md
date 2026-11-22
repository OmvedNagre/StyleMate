# StyleMate

A personal smart wardrobe assistant for iOS and Android, built with JavaScript, React Native, and Expo Router.

## Current build

Phase 1 interactive UI prototype: Home, a category-filtered Wardrobe, clothing add/edit/details forms, Discover preferences, an outfit preview, Saved Outfits, History, and Profile.

Every screen identifies demo mode. Five sample garments use offline illustrations (not photographs). Forms, favorites, and history work in memory and reset on restart. Discover displays a fixed example with an illustrative score; it does not compute recommendations. Camera/gallery controls explain availability; actual photo input and durable storage are future phases.

The planned product keeps clothing photos and SQLite data on-device, uses manually entered attributes and weather, and suggests outfits with deterministic rules. No backend, account, or AI service is required.

## Setup

Use Node.js 22 LTS and npm. From this directory:

```sh
npm ci
npm start
```

The project uses Expo SDK 58. Use an Expo Go release compatible with that SDK; see the [Expo environment guide](https://docs.expo.dev/get-started/set-up-your-environment/). The foundation only uses Expo-supported modules. No credentials or environment variables are needed.

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
- `src/demo/`: temporary sample data and session state, isolated from future persistence.
- `tests/`: component and interaction tests using Jest Expo and React Native Testing Library.
- `src/constants/theme.js`: color, spacing, typography, and radius tokens.
- `docs/StyleMate_Codex_Handoff.md`: supplied product brief and phased scope.
- `PROJECT_STATUS.md`: actual checks, limitations, and next steps.

No camera/gallery permissions are requested in this phase. Device storage and image persistence will be implemented and tested in their respective phases.

## Manual UI check

On both iOS and Android, launch the app, tap each of the four tabs, follow each screen's navigation link, check safe areas, then increase text size and verify content scrolls. Record results in `PROJECT_STATUS.md`; simulator and physical-device checks are separate.

Try this prototype flow:

1. Filter Wardrobe by Footwear, then Accessory to see an empty category.
2. Add a demo piece; submit empty fields to see validation, then choose an illustration and enter a name.
3. Open its details, edit it, then try removal (with confirmation).
4. Choose occasion/weather/style in Discover and open the fixed preview.
5. Save the demo outfit, mark it worn, then inspect Saved Outfits and History from Profile.
6. Remove a sample item and verify saved outfits explain its absence while history retains its snapshot.
7. In Profile, restore the collection, try an empty wardrobe, and inspect loading/error previews.
8. On a small device and with enlarged text, verify wrapping, scrolling, and keyboard reachability on the form.

The automated suite checks component behavior with navigation mocked. It does not replace real iOS/Android navigation, rendering, or keyboard verification. Those checks are still pending.

Next: Phase 2 — real camera/gallery input, persistent image files, and clothing management.
