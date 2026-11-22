# Native verification matrix

Phase 6 status: pending device acceptance. Host checks are not substitutes for native tests.

Environment inspected: only Apple Command Line Tools selected; no Xcode.app, simctl, adb, or Android SDK found. No physical devices were connected/tested.

| Capability | iOS Simulator | iOS device | Android Emulator | Android device |
| --- | --- | --- | --- | --- |
| Launch, tabs, back navigation | Pending | Pending | Pending | Pending |
| Camera capture/denial | Hardware-dependent | Pending | Emulator-dependent | Pending |
| Gallery select/cancel/limited access | Pending | Pending | Pending | Pending |
| SQLite restart, edits, deletion | Pending | Pending | Pending | Pending |
| Photo copy/replacement/restart | Pending | Pending | Pending | Pending |
| Recommendations offline | Pending | Pending | Pending | Pending |
| Favorites/repeat wear/history | Pending | Pending | Pending | Pending |
| Small screens, keyboard, large text | Pending | Pending | Pending | Pending |

## Execution checklist

1. Record OS, device, app version and build/Expo Go version.
2. Launch empty; navigate every tab and stack route. Confirm no fatal logs.
3. Add top and bottom from camera/gallery. Deny permission, cancel selection, use limited access. Confirm original gallery images remain untouched.
4. Enter an 80-character name, use maximum text size and a small screen. Ensure controls wrap, scroll and remain reachable above the keyboard.
5. Generate for each occasion/weather; test no footwear and missing top/bottom. Turn off network in an installed build and repeat.
6. Save two outfits, remove one favorite, mark worn, cancel Wear again, then confirm it. Verify exactly one extra entry and newest-first order.
7. Edit category/delete a saved item. Confirm wear is disabled; saved names/history remain understandable. Replace a missing photo.
8. Terminate/reopen. Verify records, favorites, history, preferences and real photos survive.
9. Test storage failure with test data; verify retry messages, no false success, and no destructive reset.
10. Record pass/fail and evidence per platform. Screenshots must be actual app captures. Resolve failures before marking Phase 6 complete.

Host verification: component/native-module mocks, pure recommendation tests, real host SQLite close/reopen tests, lint/type checks and both Hermes exports. None proves actual native permissions, rendering or filesystem behavior.
