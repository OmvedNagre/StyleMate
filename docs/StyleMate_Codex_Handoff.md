# StyleMate --- Codex Project Handoff

> **Purpose:** This document is the authoritative implementation brief
> for building StyleMate. Read it completely before changing the
> repository. Implement the application phase by phase, verify each
> phase against its acceptance criteria, and keep this document's
> decisions intact unless the user explicitly changes them.

------------------------------------------------------------------------

## 0. Instructions for Codex

You are the implementation agent for **StyleMate**, a small, polished,
personal smart-wardrobe mobile application.

Your job is to build a working React Native application for **both iOS
and Android**. Prioritize a reliable, demonstrable product, a small and
understandable codebase, and straightforward viva explanations over
architectural complexity.

### Non-negotiable rules

1.  **Use React Native with Expo** and one shared codebase for iOS and
    Android.
2.  Use **JavaScript**, not TypeScript.
3.  Use **Expo Router** for navigation.
4.  Use **Expo SQLite** for persistent structured data.
5.  Use the device's local filesystem for clothing photographs. Store
    image URIs/paths in SQLite, not image binary data.
6.  Support adding photos from **both the camera and the photo
    library/gallery**.
7.  Clothing attributes are entered and edited **manually for the
    initial version**.
8.  **AI recognition is explicitly deferred.** Do not add AI APIs, model
    SDKs, prompts, server endpoints, API keys, or AI-generated outfit
    suggestions in this implementation.
9.  Outfit suggestions must use a **deterministic, explainable,
    rule-based recommendation engine**.
10. Weather is selected **manually by the user**. Do not integrate a
    weather API or location service.
11. Keep the application **local-first**. No backend, authentication,
    cloud database, analytics service, or account system is required.
12. Keep scope strictly minimal. Do not add a weekly planner, wardrobe
    analytics dashboard, social features, chat, virtual try-on, shopping
    links, subscriptions, or unrelated features.
13. The application must remain useful without an internet connection
    after installation.
14. Do not claim a phase is complete until its acceptance criteria have
    been checked.
15. Prefer the smallest reasonable dependency set. Do not install a
    library for a feature that can be implemented cleanly with existing
    project capabilities.
16. Before modifying an existing repository, inspect its current files,
    package manager, scripts, and project state. Preserve useful
    existing work and avoid destructive resets.

### How to work

-   Start by inspecting the repository and reporting its current state.
-   If the repository is empty, initialize the project in the current
    working directory.
-   If a project already exists, adapt it rather than replacing it
    blindly.
-   Implement only the current phase. Do not skip ahead.
-   After each phase:
    -   run relevant lint/type/build checks available in the project;
    -   run the app or tests where practical;
    -   fix errors introduced by the phase;
    -   update `PROJECT_STATUS.md` with completed work, commands run,
        known issues, and the next phase.
-   If a required decision is genuinely ambiguous, choose the simplest
    option consistent with this document and record the assumption in
    `PROJECT_STATUS.md`. Ask the user only if implementation cannot
    safely proceed.
-   Do not leave fake buttons, dead navigation, placeholder actions, or
    misleading success messages.
-   Use realistic sample data only for development/demo purposes.
    Clearly distinguish demo seed data from user-created wardrobe data.

------------------------------------------------------------------------

# 1. Product definition

## 1.1 Product name

**StyleMate --- Personal Smart Wardrobe Assistant**

## 1.2 Product summary

StyleMate helps one person organize clothes they already own and choose
outfits without buying anything new.

The user adds clothing items by taking a photograph or selecting an
image from the gallery. The user manually enters a few attributes such
as category, color, style, pattern, and season. StyleMate stores the
clothing information locally and uses a rule-based recommendation engine
to generate suitable outfit combinations.

The user selects an occasion, weather condition, and preferred style.
StyleMate filters the wardrobe, builds valid outfit combinations, scores
them using transparent rules, and displays the best three suggestions.
Users can save favorite outfits and record outfits they have worn so the
app can reduce recent repetition.

## 1.3 Problem statement

People often own enough clothing but spend time deciding what to wear.
They may overlook items they already own, repeat the same combinations,
or struggle to coordinate colors and clothing types for a particular
occasion or weather condition.

StyleMate provides a simple digital wardrobe and an explainable outfit
recommendation system to address this problem.

## 1.4 Primary objective

Build a polished, small, offline-first React Native application that:

-   stores a personal wardrobe;
-   supports clothing photos from camera and gallery;
-   lets users manually classify and edit clothing;
-   generates outfit combinations with a rule-based algorithm;
-   explains why an outfit was suggested;
-   saves favorites and tracks worn outfits;
-   works on iOS and Android.

## 1.5 Target user

A single individual using the app as a personal wardrobe assistant. The
first version does not need multiple accounts or shared wardrobes.

## 1.6 Product principles

-   **Simple:** a small number of clear screens and actions.
-   **Visual:** clothing photographs are the primary content.
-   **Explainable:** recommendations show understandable reasons and
    scores.
-   **Local-first:** user data remains on the device.
-   **Cross-platform:** one codebase supports iOS and Android.
-   **Minimal:** no feature should be added unless it supports the core
    wardrobe-to-outfit journey.

------------------------------------------------------------------------

# 2. Final scope and explicit exclusions

## 2.1 Included in the initial release

  -----------------------------------------------------------------------
  Area                                Included functionality
  ----------------------------------- -----------------------------------
  Home                                Welcome, quick actions, wardrobe
                                      count, outfit-generation entry
                                      point, a suggested outfit when one
                                      can be generated

  Wardrobe                            View clothing grid, filter by
                                      category, open item details

  Add clothing                        Take a photo or choose from
                                      gallery; enter clothing attributes
                                      manually

  Edit clothing                       Update name, category, color,
                                      style, pattern, and season

  Delete clothing                     Delete the clothing record and
                                      safely remove its app-managed image
                                      file

  Discover                            Select occasion, weather, style,
                                      and optional footwear preference

  Recommendations                     Generate valid combinations, score,
                                      rank, and display up to three

  Favorites                           Save and unsave generated outfits

  History                             Mark an outfit as worn and view
                                      previously worn outfits

  Profile/settings                    Basic preferences and simple app
                                      information; no account

  Persistence                         SQLite-backed records and local
                                      image files survive app restarts
  -----------------------------------------------------------------------

## 2.2 Deferred or excluded

Do not implement these in the initial release:

-   AI clothing recognition or image classification.
-   AI-generated outfit suggestions or chatbot.
-   Any AI/LLM API integration.
-   Backend or REST API.
-   Login, signup, user accounts, or authentication.
-   Cloud sync or remote database.
-   Automatic weather lookup or location tracking.
-   Weekly outfit calendar/planner.
-   Wardrobe analytics or complex statistics.
-   Virtual try-on or body measurement.
-   Social sharing, public profiles, or messaging.
-   Shopping, affiliate links, or product recommendations.
-   Push notifications or scheduled reminders.
-   Paid plans, payments, or subscriptions.

### Future AI extension boundary

AI recognition may be considered in a future, separately approved phase.
For now, design the clothing form and data model so that a future
recognition service could prefill the same editable attributes. Do not
implement that service now.

A future AI feature must never be required for core app functionality.

------------------------------------------------------------------------

# 3. Platform and technology decisions

## 3.1 Required stack

  -----------------------------------------------------------------------
  Concern                             Decision
  ----------------------------------- -----------------------------------
  Mobile framework                    React Native

  App runtime/tooling                 Expo

  Language                            JavaScript

  Navigation/routing                  Expo Router

  Database                            Expo SQLite

  Camera/gallery                      Expo Image Picker

  Local image files                   Expo FileSystem, using APIs
                                      supported by the installed Expo SDK

  Styling                             React Native `StyleSheet`

  Safe areas                          Expo-compatible safe-area support /
                                      Expo Router defaults

  State management                    React state and Context only where
                                      shared state is genuinely needed

  Icons                               Expo-compatible icon package if
                                      needed; use a consistent small icon
                                      set

  Testing                             Jest/React Native Testing Library
                                      if practical; at minimum test core
                                      pure functions and manually verify
                                      app flows
  -----------------------------------------------------------------------

Use versions compatible with the Expo SDK selected by the project. Do
not blindly install the latest versions of native packages. Prefer
`npx expo install <package>` for Expo-managed native dependencies.

## 3.2 Development environment

The project should be runnable with standard Expo commands:

``` bash
npm install
npx expo start
```

The README must explain how to open the app on:

-   iOS Simulator (macOS with Xcode);
-   Android Emulator;
-   a physical iOS device using Expo Go or a development build, as
    appropriate;
-   a physical Android device using Expo Go or a development build, as
    appropriate.

If a chosen native module requires a development build rather than Expo
Go, document that accurately. Do not promise that every native
capability works in Expo Go without checking the selected SDK and
package.

## 3.3 Cross-platform requirements

-   Use platform-neutral React Native components wherever possible.
-   Use Expo APIs for camera, gallery, filesystem, and SQLite.
-   Respect iOS and Android permission flows.
-   Handle denied and restricted permissions gracefully.
-   Do not assume a fixed screen size, status-bar height, or
    navigation-bar height.
-   Support safe areas, notches, and home indicators.
-   Use scrollable layouts for small screens and larger text settings.
-   Avoid platform-specific paths or hardcoded filesystem locations.
-   Verify image URI handling on both platforms.
-   Verify SQLite initialization and migrations on both platforms.
-   Keep keyboard interactions usable on both platforms.
-   Do not use browser-only APIs or DOM elements.

------------------------------------------------------------------------

# 4. UX, visual direction, and design system

## 4.1 Visual concept

Use a **premium minimal fashion editorial aesthetic**. The app should
feel like a refined personal lookbook, not an admin dashboard or generic
productivity app.

Visual qualities:

-   warm ivory backgrounds;
-   charcoal text;
-   restrained muted-olive accents;
-   generous whitespace;
-   large, well-cropped clothing photographs;
-   understated borders and shadows;
-   elegant headings paired with highly readable body text;
-   consistent spacing and clear visual hierarchy.

Avoid:

-   excessive gradients;
-   neon colors;
-   overly rounded, toy-like cards;
-   dense dashboards;
-   decorative charts;
-   too many accent colors;
-   unnecessary animation;
-   oversized icons;
-   excessive borders and separators.

## 4.2 Design tokens

Create one central theme/constants file. Do not scatter color and
spacing literals throughout the app.

Suggested palette:

  Token             Value       Use
  ----------------- ----------- ---------------------
  `background`      `#F7F5F0`   Main app background
  `surface`         `#FFFFFF`   Cards and sheets
  `textPrimary`     `#20201E`   Main text
  `textSecondary`   `#77736C`   Secondary text
  `accent`          `#7D8063`   Muted olive actions
  `border`          `#E7E3DA`   Subtle dividers
  `danger`          `#B4534B`   Destructive actions
  `success`         `#58745C`   Positive status

Spacing should follow a consistent 4-point or 8-point scale. Suggested
values: 4, 8, 12, 16, 24, 32.

Suggested corner radii:

-   small controls: 8--10;
-   cards: 12--16;
-   large image panels: 16--20;
-   pills: fully rounded only when appropriate.

Typography:

-   Use a restrained editorial display style for large screen headings
    if a bundled, licensed font is easy to add.
-   Otherwise use platform-safe system fonts.
-   Keep body text highly readable.
-   Avoid adding a font dependency solely for decoration.

## 4.3 Shared UI components

Create reusable components only where they remove real duplication.
Suggested components:

-   `ScreenContainer`
-   `AppHeader`
-   `PrimaryButton`
-   `SecondaryButton`
-   `ClothingCard`
-   `ClothingGrid`
-   `CategoryChip`
-   `EmptyState`
-   `LoadingState`
-   `ErrorState`
-   `OutfitCard`
-   `ScoreIndicator`
-   `FormField`
-   `SelectionChip`

Do not create an abstraction for every small `View`. Prefer a small
component set that is easy to understand.

## 4.4 Accessibility and usability

-   Provide readable contrast.
-   Give icon-only buttons accessible labels.
-   Ensure buttons have usable touch targets.
-   Use labels for form controls.
-   Show validation messages near invalid fields.
-   Do not communicate status by color alone.
-   Provide empty states and clear recovery actions.
-   Use confirmation before destructive deletion.
-   Make the app usable without relying on animation.

------------------------------------------------------------------------

# 5. Navigation and screen specification

Use Expo Router. A bottom tab bar should expose four primary areas:

1.  Home
2.  Wardrobe
3.  Discover
4.  Profile

Saved outfits and outfit history may be nested within Profile or
presented as simple stack routes. Do not add a fifth tab unless there is
a strong usability reason.

## 5.1 Home screen

### Purpose

Give the user a quick overview and a direct path to outfit generation.

### Required UI

-   A short greeting/header.
-   A prominent "Generate an outfit" action.
-   Wardrobe item count.
-   A "recently added" section with a small number of clothing items.
-   A suggested outfit section if the app can create a valid
    recommendation from the current wardrobe.
-   A useful empty state when the wardrobe is empty.

### Behaviour

-   "Generate an outfit" navigates to Discover.
-   Tapping a recent clothing item opens its details.
-   Tapping a suggested outfit opens its details/results.
-   If there are not enough compatible clothing items, explain what the
    user should add rather than showing fake recommendations.

## 5.2 Wardrobe screen

### Purpose

Display and manage the user's clothing inventory.

### Required UI

-   Screen title and item count.
-   Category filter chips.
-   Responsive two-column clothing grid on typical phones.
-   Add-clothing action.
-   Empty state with an add action.
-   Clothing image, name, and category on each card.

### Categories

Use a controlled set of categories:

-   `topwear`
-   `bottomwear`
-   `footwear`
-   `accessory`
-   `outerwear`

Examples of item types:

-   topwear: T-shirt, shirt, polo, sweater, hoodie;
-   bottomwear: jeans, trousers, chinos, shorts, joggers;
-   footwear: sneakers, formal shoes, boots, sandals;
-   accessory: watch, belt, cap, bag;
-   outerwear: jacket, coat, overshirt.

Keep category and type values consistent. Avoid free-form category
strings that make filtering unreliable.

### Behaviour

-   Category filters show only matching items.
-   "All" shows all items.
-   Tapping a card opens Clothing Details.
-   Add action opens Add Clothing.
-   Item count updates after create/delete.

## 5.3 Add Clothing screen

### Purpose

Add an item to the digital wardrobe.

### Image input

Offer two explicit actions:

-   **Take Photo** --- use the device camera.
-   **Choose from Gallery** --- select an existing photo.

Use Expo Image Picker APIs compatible with the installed Expo SDK.

### Required fields

-   Photo (required).
-   Clothing name (required; can be a sensible default such as the
    selected type, but user must be able to edit it).
-   Category (required).
-   Item type (required).
-   Primary color (required).
-   Style (required).
-   Pattern (optional but recommended).
-   Season (one or more selections; required or default to `allSeason`).

### Suggested controlled values

**Style** - `casual` - `smartCasual` - `formal` - `sporty` - `ethnic` -
`versatile`

**Pattern** - `plain` - `striped` - `checked` - `printed` - `textured` -
`other`

**Season** - `summer` - `winter` - `monsoon` - `allSeason`

**Primary color** Use a manageable initial palette: - black - white -
grey - navy - blue - lightBlue - beige - brown - cream - olive - green -
red - maroon - pink - yellow - other

Display friendly labels in the UI while storing stable identifiers.

### Validation

-   Do not save without an image.
-   Do not save without category, type, color, and style.
-   Prevent blank names.
-   Show a clear validation message.
-   Disable or show loading on the save action while saving.
-   Prevent duplicate submissions.
-   If image copying fails, do not create a record with a broken image
    URI.

### Behaviour

1.  User chooses camera or gallery.
2.  App requests permission if needed.
3.  User selects/captures image.
4.  Show a preview.
5.  User enters attributes.
6.  On save, copy the selected image into app-managed persistent
    storage.
7.  Insert metadata and stored image URI into SQLite.
8.  Return to Wardrobe and show the new item.

## 5.4 Clothing Details screen

### Required UI

-   Large clothing photo.
-   Item name.
-   Category and type.
-   Color.
-   Style.
-   Pattern.
-   Season.
-   Edit action.
-   Delete action.

### Behaviour

-   Edit opens a prefilled form.
-   Delete requires confirmation.
-   After deletion, remove the database record and safely delete the
    corresponding app-managed image file.
-   Never delete a file that is outside the app's managed image
    directory.
-   If a file is already missing, still allow the metadata record to be
    deleted.

## 5.5 Discover screen

### Purpose

Collect a small set of inputs for recommendations.

### Inputs

**Occasion** - `college` - `casual` - `formal` - `party` - `outing`

**Weather** - `hot` - `normal` - `cold` - `rainy`

Weather is manually selected. Do not request location permission or call
a weather API.

**Preferred style** - `any` - `casual` - `smartCasual` - `formal` -
`sporty` - `ethnic` - `versatile`

**Footwear preference** - `any` - `sneakers` - `formalShoes` - `boots` -
`sandals`

Keep the form short and visually clear. Default sensible values where
possible, but make the selected values visible.

### Behaviour

-   User selects preferences.
-   User taps "Generate outfits".
-   App runs the local recommendation engine.
-   If there are insufficient wardrobe items, show a helpful message and
    link to Wardrobe.
-   No network request is made.

## 5.6 Outfit Results screen

### Required UI

Display up to three highest-ranked outfit suggestions.

Each outfit card/detail should show:

-   topwear image/name, if present;
-   bottomwear image/name;
-   footwear image/name, if present;
-   optional outerwear/accessory;
-   score out of 100;
-   short explanation/reasons;
-   favorite toggle;
-   "Mark as worn" action.

### Behaviour

-   Sort by descending score.
-   Do not show duplicate combinations.
-   Do not display an outfit that violates required category rules.
-   Save favorites persistently.
-   Marking as worn inserts an outfit history record.
-   If a user removes a clothing item used by a saved outfit, handle the
    saved outfit gracefully. Prefer keeping historical snapshot
    information or mark the outfit unavailable; never crash or render
    broken item references.

## 5.7 Profile screen

Keep this minimal.

Include:

-   Saved Outfits entry.
-   Outfit History entry.
-   Basic style preference if required.
-   About StyleMate / version information.
-   No login, account details, profile photo, or cloud controls.

## 5.8 Saved Outfits screen

-   Display favorited outfits.
-   Show outfit components and score.
-   Allow removing from favorites.
-   Handle missing/deleted wardrobe items gracefully.
-   Provide a clear empty state.

## 5.9 Outfit History screen

-   Display outfits marked as worn, newest first.
-   Show date worn.
-   Show the outfit components if still available.
-   Handle deleted clothing records gracefully.
-   History is used by the recommendation engine to reduce repetition.

------------------------------------------------------------------------

# 6. Data model and SQLite design

Use SQLite for structured data and the filesystem for images.

Keep database access in one service/module. Do not put SQL statements
directly inside screen components.

## 6.1 Clothing table

Suggested schema:

``` sql
CREATE TABLE IF NOT EXISTS clothing (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  image_uri TEXT NOT NULL,
  category TEXT NOT NULL,
  item_type TEXT NOT NULL,
  color TEXT NOT NULL,
  style TEXT NOT NULL,
  pattern TEXT,
  seasons_json TEXT NOT NULL DEFAULT '["allSeason"]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Notes:

-   `seasons_json` stores an array of stable season identifiers.
-   Use ISO 8601 strings for timestamps.
-   `image_uri` points to a file copied into app-managed persistent
    storage.
-   Store no raw image binary in SQLite.

## 6.2 Outfits table

Suggested schema:

``` sql
CREATE TABLE IF NOT EXISTS outfits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  clothing_ids_json TEXT NOT NULL,
  score INTEGER NOT NULL,
  occasion TEXT NOT NULL,
  weather TEXT NOT NULL,
  preferred_style TEXT NOT NULL,
  reasons_json TEXT NOT NULL,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

`clothing_ids_json` contains the selected clothing IDs. `reasons_json`
stores short human-readable recommendation reasons.

For resilience, if a clothing item is deleted, the UI must not assume
every ID still exists. It is acceptable to retain the outfit record and
show that an item is no longer available, or to snapshot enough display
metadata to render historical records. Choose the simplest robust
approach and document it.

## 6.3 Outfit history table

Suggested schema:

``` sql
CREATE TABLE IF NOT EXISTS outfit_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  outfit_id INTEGER,
  outfit_snapshot_json TEXT NOT NULL,
  worn_at TEXT NOT NULL,
  FOREIGN KEY (outfit_id) REFERENCES outfits(id) ON DELETE SET NULL
);
```

The snapshot should preserve enough information to show what was worn
even if the source outfit or clothing items are later deleted.

## 6.4 Database requirements

-   Initialize database once during app startup.
-   Create tables with `IF NOT EXISTS`.
-   Use parameterized SQL queries.
-   Use transactions for multi-step operations where appropriate.
-   Add a simple schema version/migration strategy, even if the first
    version has only one migration.
-   Enable foreign keys where supported and needed.
-   Handle initialization errors with a visible recoverable error state.
-   Keep CRUD functions in a database service.
-   Do not create a complex ORM layer for this small project.

Suggested service API:

``` js
initializeDatabase()
getAllClothing()
getClothingById(id)
createClothing(item)
updateClothing(id, item)
deleteClothing(id)

getSavedOutfits()
saveOutfit(outfit)
toggleFavorite(outfitId, isFavorite)

addOutfitHistory(entry)
getOutfitHistory()
getRecentlyWornOutfitIds(days)
```

Function names can change if the implementation has a consistent,
simpler interface.

------------------------------------------------------------------------

# 7. Local image handling

This is a core feature and must be implemented carefully.

## 7.1 Required flow

1.  Open camera or gallery using Expo Image Picker.
2.  Receive a selected image URI.
3.  Display a preview.
4.  On save, copy the image to an app-managed persistent directory.
5.  Store the new persistent URI/path in SQLite.
6.  Load images from that stored path in wardrobe and outfit views.

Do not rely on temporary picker/cache URIs for long-term persistence.

## 7.2 File naming

Use a collision-resistant filename, for example a timestamp plus a
random suffix, while keeping the extension when available.

Example directory concept:

``` text
app-managed-data/
  wardrobe/
    clothing-<unique-id>.jpg
```

Use the actual supported Expo FileSystem directory APIs for the
installed SDK. Do not hardcode the physical sandbox path.

## 7.3 Image requirements

-   Preserve reasonable image quality.
-   Resize/compress only if it can be done reliably with an
    Expo-compatible package and without unnecessary complexity.
-   Use a consistent image aspect ratio in cards.
-   Use `resizeMode="cover"` or the modern equivalent appropriate to the
    selected component.
-   Provide a fallback placeholder if an image cannot be loaded.
-   Avoid loading unnecessarily large full-resolution images into every
    grid cell if thumbnails can be produced simply.

## 7.4 Permission handling

-   Ask for camera permission only when the user chooses Take Photo.
-   Ask for media-library permission only when the user chooses Gallery,
    subject to the platform/API permission model.
-   If permission is denied, explain how the user can enable it in
    Settings.
-   Do not repeatedly prompt in a loop.
-   Handle cancellation as a normal user action, not an error.
-   Document iOS usage descriptions and Android permissions as required
    by the selected Expo SDK.

------------------------------------------------------------------------

# 8. Rule-based recommendation engine

This is the central technical feature. It must be deterministic,
testable, and easy to explain in a viva.

## 8.1 Core principle

The recommendation engine uses only the clothing attributes entered by
the user and the user's Discover selections.

**No AI, machine learning, remote service, or external API is
involved.**

The engine:

1.  filters clothing by category and user preferences;
2.  creates valid combinations;
3.  checks color compatibility;
4.  checks occasion/style compatibility;
5.  checks weather suitability;
6.  reduces scores for recently worn combinations;
7.  ranks the results;
8.  returns up to three unique outfits with reasons.

## 8.2 Outfit structure

For the first version, a normal outfit consists of:

-   exactly one topwear item;
-   exactly one bottomwear item;
-   optionally one footwear item;
-   optionally one outerwear item;
-   optionally one accessory item.

To avoid a combinatorial explosion and keep results understandable:

-   Require one topwear and one bottomwear item.
-   Prefer including footwear when available and compatible.
-   Include at most one outerwear item.
-   Include at most one accessory item.
-   Do not generate every possible accessory permutation.
-   Limit the number of candidate combinations if the wardrobe becomes
    large.

A valid outfit must never contain two topwear items or two bottomwear
items.

## 8.3 Occasion compatibility

Use a small, explicit compatibility map.

Suggested starting rules:

  Occasion   Strongly compatible styles       Possible styles
  ---------- -------------------------------- ---------------------
  College    casual, smartCasual, versatile   sporty
  Casual     casual, versatile                smartCasual, sporty
  Formal     formal, smartCasual              versatile
  Party      smartCasual, formal, casual      versatile
  Outing     casual, smartCasual, versatile   sporty

Treat these as simple heuristic rules, not fashion facts. Keep the map
centralized and easy to adjust.

A clothing item whose style is not compatible may be filtered out or
receive a lower score. Prefer filtering only clearly unsuitable items
and scoring softer mismatches so the app can still produce results from
a small wardrobe.

## 8.4 Color compatibility

Implement a small, documented compatibility map or color-family rule
set. Do not attempt to implement a complete color-theory engine.

Suggested high-compatibility pairs:

-   black + white
-   black + grey
-   black + beige
-   navy + white
-   navy + beige
-   blue + white
-   olive + beige
-   olive + black
-   grey + white
-   brown + cream
-   maroon + black
-   denim blue + white

Suggested neutral colors:

-   black
-   white
-   grey
-   beige
-   cream
-   navy
-   brown

Rules:

-   Neutral colors should generally be treated as easy to combine.
-   Exact same-color combinations should not automatically receive the
    highest score.
-   Unknown/other colors should receive a neutral score rather than
    causing errors.
-   Color matching should be explainable, for example: "Navy and white
    are a strong neutral contrast."
-   Store the compatibility logic in one utility file and unit-test it.

A simple score scale can be used:

-   excellent match: 30 points;
-   good/neutral match: 22--26 points;
-   acceptable match: 15--20 points;
-   poor match: 5--10 points.

The exact score mapping should be centralized and documented.

## 8.5 Weather suitability

Weather is selected manually as one of:

-   `hot`
-   `normal`
-   `cold`
-   `rainy`

Suggested rules:

**Hot** - Prefer summer and all-season items. - Reduce suitability for
winter-only items. - Avoid heavy outerwear unless explicitly marked
all-season/lightweight.

**Normal** - Prefer all-season items. - Summer and winter items may
remain eligible with neutral scores.

**Cold** - Prefer winter and all-season items. - Give outerwear a
positive contribution when available. - Reduce suitability for
summer-only items.

**Rainy** - Prefer items that are not explicitly winter-only or
otherwise unsuitable. - Avoid making unsupported claims about waterproof
properties because the data model does not record waterproofing. - If
footwear is included, do not claim it is rain-safe unless the user has
entered that as a future attribute. - Give a modest score to
weather-compatible combinations and explain only what the stored
attributes support.

Do not invent weather information. The user supplies the condition.

## 8.6 Style matching

The selected preferred style can be `any` or a specific style.

-   If `any`, do not penalize style mismatch.
-   If a specific style is selected and the item matches, award the full
    style points.
-   If the item is `versatile`, award a partial/high compatibility
    score.
-   If the item is a close compatible style, award partial points.
-   If it is clearly incompatible, filter it or award a low score.

Keep style compatibility in a centralized map.

## 8.7 Repetition avoidance

Use `outfit_history` to identify recently worn combinations.

Suggested initial behaviour:

-   Exact combination worn within the last 3 days: strong penalty.
-   Exact combination worn within the last 7 days: moderate penalty.
-   Not worn recently: full repetition points.

Use a deterministic rule and explain it in code comments and project
documentation.

If there is no history, award full repetition points.

Do not treat a missing/deleted outfit as a fatal error.

## 8.8 Scoring formula

Use a score out of 100:

  Component                  Maximum
  ------------------------ ---------
  Occasion compatibility          30
  Color compatibility             30
  Weather suitability             20
  Style compatibility             10
  Repetition avoidance            10
  **Total**                  **100**

Conceptual formula:

``` text
finalScore =
  occasionScore +
  colorScore +
  weatherScore +
  styleScore +
  repetitionScore
```

Each component must be bounded by its allocated maximum. Final score
must be an integer between 0 and 100.

Important: if a criterion does not apply (for example, no footwear item
is available), do not accidentally give an outfit an unfair score of
zero for a missing optional item. Define scoring at the outfit level and
document how optional items are treated.

## 8.9 Candidate generation

A simple approach:

``` js
function generateOutfits(wardrobe, preferences, history) {
  const tops = filterItems(wardrobe, "topwear", preferences);
  const bottoms = filterItems(wardrobe, "bottomwear", preferences);
  const shoes = filterItems(wardrobe, "footwear", preferences);
  const outerwear = filterItems(wardrobe, "outerwear", preferences);
  const accessories = filterItems(wardrobe, "accessory", preferences);

  const candidates = [];

  for (const top of tops) {
    for (const bottom of bottoms) {
      // Add compatible optional footwear/outerwear/accessory
      // Score the combination
      // Keep a bounded number of candidates
    }
  }

  return rankAndDeduplicate(candidates).slice(0, 3);
}
```

This is conceptual pseudocode, not a requirement to copy verbatim.
Implement the simplest reliable version.

## 8.10 Result shape

Return plain JavaScript objects, for example:

``` js
{
  id: "generated-stable-key",
  clothingIds: [1, 4, 7],
  score: 90,
  occasion: "college",
  weather: "normal",
  reasons: [
    "The selected styles suit a college setting.",
    "The colors form a balanced combination.",
    "The selected items suit normal weather.",
    "This combination has not been worn recently."
  ]
}
```

Use stable IDs or deterministic combination keys where possible. Do not
use array indices as persistent identifiers.

## 8.11 Recommendation edge cases

Handle these explicitly:

-   No topwear available.
-   No bottomwear available.
-   Only one valid top/bottom pair.
-   No footwear available.
-   No outerwear or accessories available.
-   All candidate combinations are recently worn.
-   All combinations have low scores.
-   A clothing record has an unknown color/style/season value.
-   A clothing item was deleted after an outfit was saved.
-   The wardrobe contains many items and candidate generation becomes
    expensive.

If fewer than three valid combinations exist, show fewer than three.
Never fabricate outfits to fill the screen.

If there are no valid combinations, show a helpful message such as: "Add
at least one topwear and one bottomwear item to generate outfits."

------------------------------------------------------------------------

# 9. Suggested project structure

Use a compact structure similar to this. Adapt only if the installed
Expo Router template requires a small variation.

``` text
StyleMate/
├── app/
│   ├── _layout.js
│   ├── (tabs)/
│   │   ├── _layout.js
│   │   ├── index.js              # Home
│   │   ├── wardrobe.js
│   │   ├── discover.js
│   │   └── profile.js
│   ├── clothing/
│   │   ├── add.js
│   │   └── [id].js
│   ├── outfits/
│   │   ├── results.js
│   │   ├── saved.js
│   │   └── history.js
│   └── +not-found.js
│
├── components/
│   ├── AppHeader.js
│   ├── PrimaryButton.js
│   ├── ClothingCard.js
│   ├── OutfitCard.js
│   ├── CategoryChip.js
│   ├── EmptyState.js
│   └── FormField.js
│
├── services/
│   ├── database.js
│   └── imageService.js
│
├── utils/
│   ├── recommendationEngine.js
│   ├── colorMatcher.js
│   ├── compatibility.js
│   └── dateUtils.js
│
├── constants/
│   ├── theme.js
│   └── wardrobeOptions.js
│
├── hooks/
│   └── useWardrobe.js            # Only if it meaningfully reduces duplication
│
├── assets/
│   └── images/
│
├── docs/
│   └── ARCHITECTURE.md
│
├── PROJECT_STATUS.md
├── README.md
├── app.json
└── package.json
```

Do not create empty files just to match this tree. Add files when their
functionality is implemented.

Keep route components relatively thin. Put SQL in
`services/database.js`, image persistence in `services/imageService.js`,
and pure recommendation logic in `utils/`.

------------------------------------------------------------------------

# 10. Phase-by-phase implementation plan

Each phase must end with a working, verifiable state.

## Phase 0 --- Repository inspection and project foundation

### Objectives

-   Inspect current repository and environment.
-   Initialize or adapt Expo project.
-   Establish JavaScript and Expo Router.
-   Create a clean folder structure.
-   Establish theme tokens and app entry/navigation.
-   Confirm the app starts on iOS and Android targets.

### Tasks

1.  Inspect `pwd`, repository files, `package.json`, Git status, and
    existing scripts.
2.  Do not overwrite existing user work.
3.  If empty, initialize a current Expo project using a compatible Expo
    Router template.
4.  Confirm JavaScript configuration.
5.  Install only required packages, using Expo-compatible versions.
6.  Create the root layout and bottom tab navigation.
7.  Create placeholder route screens with the final screen names.
8.  Add central theme constants.
9.  Add `PROJECT_STATUS.md`.
10. Update README with initial setup instructions.

### Acceptance criteria

-   App starts using the documented Expo command.
-   Home, Wardrobe, Discover, and Profile tabs navigate.
-   No TypeScript files are introduced for application logic.
-   No AI, backend, authentication, or weather API dependencies are
    added.
-   No fatal runtime errors on initial launch.
-   iOS and Android layouts respect safe areas.

### Phase deliverable

A runnable Expo shell with navigation and design foundations.

------------------------------------------------------------------------

## Phase 1 --- Screen UI and design system

### Objectives

Build all core screens with local mock/sample data before integrating
persistence.

### Tasks

1.  Implement Home screen layout.
2.  Implement Wardrobe grid and category chips.
3.  Implement Add Clothing form UI.
4.  Implement Clothing Details UI.
5.  Implement Discover preference form.
6.  Implement Outfit Results cards.
7.  Implement Profile with Saved Outfits and History links.
8.  Implement Saved Outfits and Outfit History layouts.
9.  Build reusable components where appropriate.
10. Add empty, loading, and error states.
11. Verify keyboard behaviour and scroll behaviour.
12. Maintain the premium minimal fashion visual direction.

### Constraints

-   Sample data is temporary and must not be treated as persistent user
    data.
-   No fake actions: if a button is visible, it should navigate or
    perform a clearly indicated temporary action.
-   Do not build the recommendation algorithm in this phase beyond a
    clearly labeled mock result for layout testing.

### Acceptance criteria

-   All required screens render.
-   Navigation works.
-   Visual hierarchy is consistent.
-   Forms are usable on smaller devices.
-   Empty states are present.
-   No screen overflows horizontally on common phone sizes.
-   UI works in both iOS and Android environments.

### Phase deliverable

A complete navigable UI prototype.

------------------------------------------------------------------------

## Phase 2 --- Clothing photo capture and wardrobe CRUD

### Objectives

Allow the user to add, view, edit, and delete clothing items, including
photographs.

### Tasks

1.  Integrate Expo Image Picker.
2.  Add separate camera and gallery actions.
3.  Request permissions only when needed.
4.  Handle permission denial and cancellation.
5.  Show selected image preview.
6.  Build form validation for required clothing attributes.
7.  Implement a local image persistence service.
8.  Copy selected photos to the app-managed persistent directory.
9.  Implement temporary in-memory CRUD if the database phase is not yet
    complete, or integrate directly with SQLite if doing so reduces
    throwaway code.
10. Implement category filters.
11. Implement item details, edit, and delete.
12. Confirm delete flow cleans up app-managed files safely.

### Acceptance criteria

-   User can take a photo on a supported physical device.
-   User can choose a photo from gallery.
-   Cancellation does not crash or show a false error.
-   Permission denial is handled with a helpful explanation.
-   Image preview appears before saving.
-   Required fields are validated.
-   User can add, edit, view, and delete an item.
-   App does not retain only a temporary picker URI as the permanent
    image path.
-   Deleting an item does not delete a file outside the app-managed
    directory.
-   No AI recognition is present.

### Phase deliverable

A functional photo-based clothing manager.

------------------------------------------------------------------------

## Phase 3 --- SQLite persistence

### Objectives

Persist clothing, outfits, favorites, and history locally.

### Tasks

1.  Implement database initialization.
2.  Create clothing, outfits, and outfit history tables.
3.  Add schema versioning/migration entry point.
4.  Implement parameterized CRUD methods.
5.  Connect wardrobe UI to SQLite.
6.  Ensure clothing image files and database records remain coordinated.
7.  Add persistent favorites.
8.  Add persistent outfit history.
9.  Add loading and database-error handling.
10. Verify data survives app restarts.

### Acceptance criteria

-   Clothing records persist after closing/reopening the app.
-   Image files persist and load after restart.
-   Editing updates the correct record.
-   Deleting removes the record and safely handles its image file.
-   Favorites persist.
-   Outfit history persists.
-   SQL uses parameterized values.
-   Database initialization is safe to run more than once.
-   A failed save does not leave inconsistent or misleading UI state.
-   Works on both iOS and Android.

### Phase deliverable

A local-first wardrobe app with durable data.

------------------------------------------------------------------------

## Phase 4 --- Rule-based recommendation engine

### Objectives

Implement the deterministic outfit generator and connect it to Discover
and Results.

### Tasks

1.  Define and centralize occasion compatibility.
2.  Define and centralize color compatibility.
3.  Define weather suitability.
4.  Define style compatibility.
5.  Implement valid outfit candidate generation.
6.  Implement score calculation out of 100.
7.  Implement recent outfit repetition penalty.
8.  Deduplicate outfit combinations.
9.  Sort by score and return up to three.
10. Generate short rule-based explanations.
11. Connect Discover preferences to the engine.
12. Render actual outfit results with clothing photos.
13. Handle insufficient wardrobe data and all edge cases.
14. Write unit tests for pure utility functions and the engine.

### Required scoring

-   Occasion compatibility: 30 points.
-   Color compatibility: 30 points.
-   Weather suitability: 20 points.
-   Style compatibility: 10 points.
-   Repetition avoidance: 10 points.
-   Maximum total: 100.

### Acceptance criteria

-   The same wardrobe, preferences, and history produce the same ranked
    results.
-   No network call is made during recommendation generation.
-   No AI service is used.
-   Every returned outfit contains one topwear and one bottomwear item.
-   Optional categories are included only when available and compatible.
-   Scores are integers from 0 to 100.
-   Reasons match the actual rules applied.
-   Duplicate combinations are not returned.
-   Up to three results are returned, never fabricated.
-   Empty/insufficient wardrobe states are helpful.
-   Recent repetition affects ranking predictably.
-   Core recommendation functions have tests.

### Phase deliverable

A working, explainable rule-based outfit recommendation system.

------------------------------------------------------------------------

## Phase 5 --- Favorites and outfit history

### Objectives

Complete the user feedback loop around recommendations.

### Tasks

1.  Add favorite/unfavorite action on results.
2.  Persist favorite state in SQLite.
3.  Build Saved Outfits screen.
4.  Add "Mark as worn" action.
5.  Store a history snapshot with date/time.
6.  Build Outfit History screen.
7.  Use history to reduce recently repeated combinations.
8.  Handle deleted clothing items in saved/history entries.

### Acceptance criteria

-   Favorite state survives app restart.
-   User can remove an outfit from favorites.
-   Mark-as-worn creates one history entry.
-   History is ordered newest first.
-   History entries remain understandable if a clothing item is later
    deleted.
-   Recommendation engine uses recent history.
-   No duplicate history entries are created by accidental repeated taps
    unless the user explicitly marks the outfit worn again.

### Phase deliverable

A complete recommendation, save, and wear-history workflow.

------------------------------------------------------------------------

## Phase 6 --- Cross-platform testing, polish, and reliability

### Objectives

Make the app stable and visually consistent on iOS and Android.

### Tasks

1.  Test launch and navigation on iOS Simulator/device.
2.  Test launch and navigation on Android Emulator/device.
3.  Test camera permission and capture on supported physical devices.
4.  Test gallery permission and image selection.
5.  Test app restart and image persistence.
6.  Test database persistence.
7.  Test small-screen layouts.
8.  Test keyboard and form validation.
9.  Test long clothing names and missing images.
10. Test empty wardrobe and insufficient combinations.
11. Test deletion of items used by saved outfits/history.
12. Fix UI spacing, safe-area, and platform-specific issues.
13. Remove unused dependencies and dead code.
14. Check logs for warnings and errors.
15. Verify no AI or remote service is accidentally required.

### Acceptance criteria

-   No critical crashes in core flows.
-   Both platforms can navigate all primary screens.
-   Camera and gallery flows work where permissions/hardware allow.
-   All user data remains local.
-   Images persist across restarts.
-   Recommendation generation works offline.
-   Empty and error states are understandable.
-   No dead buttons or misleading success messages.
-   The app is suitable for a live college demonstration.

### Phase deliverable

A polished and tested cross-platform MVP.

------------------------------------------------------------------------

## Phase 7 --- Documentation and viva readiness

### Objectives

Prepare the project for handoff, demonstration, and academic evaluation.

### Tasks

1.  Write a clear README.
2.  Document setup and run commands.
3.  Document iOS and Android testing steps.
4.  Create `docs/ARCHITECTURE.md`.
5.  Explain database tables and image storage.
6.  Explain the recommendation formula with a worked example.
7.  Document permissions and offline behaviour.
8.  Add screenshots if available from actual app runs.
9.  Prepare a short demo script.
10. Prepare concise viva questions and answers.
11. Update `PROJECT_STATUS.md` with final status and known limitations.

### Acceptance criteria

-   A new developer can install and run the app from README
    instructions.
-   Architecture is understandable without reading every source file.
-   Recommendation logic can be explained in a few minutes.
-   No undocumented secrets or API keys are needed.
-   Known limitations are stated honestly.
-   Screenshots, if included, are real app screenshots and not mockups
    presented as actual output.

### Phase deliverable

A submission-ready project with setup, architecture, and viva
documentation.

------------------------------------------------------------------------

# 11. Testing strategy

## 11.1 Pure logic tests

Prioritize tests for:

-   color compatibility;
-   occasion compatibility;
-   weather suitability;
-   style compatibility;
-   score boundaries;
-   candidate generation;
-   outfit deduplication;
-   repetition penalty;
-   empty wardrobe handling.

The recommendation engine should be mostly pure JavaScript functions so
it can be tested without rendering React Native screens.

## 11.2 Manual test scenarios

  Scenario                         Expected result
  -------------------------------- -------------------------------------------------
  Empty wardrobe                   Helpful empty state and add-clothing action
  Add one top only                 No outfit generated; explain missing bottomwear
  Add top and bottom               At least one valid candidate if compatible
  Add footwear                     Footwear may be included
  Deny camera permission           Helpful permission explanation
  Cancel gallery picker            Return to form without error
  Save item with missing name      Validation message
  Close and reopen app             Wardrobe and images remain
  Edit clothing color              Updated value affects future recommendations
  Delete clothing                  Item disappears and image is safely cleaned
  Favorite an outfit               It appears in Saved Outfits
  Mark outfit worn                 It appears in History
  Repeat recent outfit             Score is reduced
  Unknown color value              Engine does not crash
  Delete an item used in history   History remains readable
  Offline recommendation           Recommendations still work

## 11.3 Cross-platform verification

Record which checks were actually performed. Do not mark physical-device
testing complete if only a simulator/emulator was used.

Suggested verification matrix:

  -------------------------------------------------------------------------------------------
  Capability          iOS Simulator        iOS Device     Android Emulator     Android Device
  ------------------- -------------------- -------------- -------------------- --------------
  Launch/navigation   Test                 Test           Test                 Test

  Gallery             Test                 Test           Test                 Test

  Camera              Hardware-dependent   Test           Emulator-dependent   Test

  SQLite persistence  Test                 Test           Test                 Test

  Image persistence   Test                 Test           Test                 Test

  Recommendation      Test                 Test           Test                 Test
  engine                                                                       
  -------------------------------------------------------------------------------------------

------------------------------------------------------------------------

# 12. Performance and code-size guidelines

The project should remain small enough for a student to understand and
explain.

## 12.1 Code principles

-   Use functional components and hooks.
-   Use JavaScript.
-   Keep components focused.
-   Keep SQL out of UI files.
-   Keep recommendation logic out of UI files.
-   Avoid Redux unless a demonstrated need appears.
-   Avoid a backend.
-   Avoid unnecessary design systems or UI frameworks.
-   Avoid over-abstraction and excessive custom hooks.
-   Reuse components where it meaningfully reduces duplication.
-   Prefer readable code over clever one-liners.
-   Add comments to explain non-obvious logic, not every line.

## 12.2 LOC target

A rough target for core application code is **approximately 600--900
lines**, excluding generated files, dependencies, lockfiles, and
extensive documentation.

This is a target, not a hard constraint. Do not sacrifice correctness,
accessibility, or maintainability merely to hit a line count.

## 12.3 Dependency discipline

Before adding a dependency:

1.  Confirm the feature is required.
2.  Check whether Expo already provides a suitable API.
3.  Check compatibility with the selected Expo SDK.
4.  Prefer `npx expo install` for native Expo packages.
5.  Avoid adding multiple packages that solve the same problem.
6.  Update README/setup instructions if the dependency changes the
    development workflow.

------------------------------------------------------------------------

# 13. Privacy, data handling, and reliability

-   Clothing photographs are personal data and should remain on-device.
-   Do not upload photos to external services.
-   Do not add analytics or tracking.
-   Do not request location permission.
-   Do not request contacts permission.
-   Do not request notification permission.
-   Request camera/gallery access only when the user invokes those
    actions.
-   Do not log private image paths or user data unnecessarily.
-   Handle missing image files gracefully.
-   Handle database errors without corrupting existing data.
-   Avoid destructive database resets during development.
-   Do not store secrets because the initial application has no API
    integration.

------------------------------------------------------------------------

# 14. README requirements

The final README should include:

1.  Project name and short description.
2.  Problem statement.
3.  Key features.
4.  Technology stack.
5.  Screenshots from the actual app, if available.
6.  Folder structure.
7.  Prerequisites.
8.  Installation commands.
9.  Run commands.
10. iOS instructions.
11. Android instructions.
12. Permission notes.
13. Database and image-storage explanation.
14. Recommendation algorithm explanation.
15. Testing instructions.
16. Current limitations.
17. Future scope, clearly identifying AI recognition as future work
    only.

Do not claim the app uses AI in the current version. It is a rule-based
smart wardrobe assistant. AI recognition is a possible future extension.

------------------------------------------------------------------------

# 15. Viva explanation

The application should be easy to explain in a 5--10 minute evaluation.

## 15.1 Short project explanation

"StyleMate is a React Native mobile application that helps users
organize their personal wardrobe and choose outfits. Users add
photographs of their clothes and manually enter details such as
category, color, style, pattern, and season. The app stores the
information locally using SQLite and keeps the photographs in the
device's app storage.

The user selects an occasion, weather condition, and preferred style. A
rule-based recommendation engine filters the available clothing, creates
valid combinations, calculates compatibility scores, and displays the
top three outfits. Users can save favorite outfits and record what they
have worn. The application works on both iOS and Android and does not
require a backend or internet connection for its core functionality."

## 15.2 Likely viva questions

Prepare concise answers for:

1.  What problem does StyleMate solve?
2.  Why did you choose React Native?
3.  What is Expo and why did you use it?
4.  How does navigation work?
5.  How do you select an image from the camera or gallery?
6.  Why do you copy the image into app storage?
7.  Why did you choose SQLite?
8.  What is CRUD?
9.  What is a rule-based recommendation system?
10. How does the outfit scoring formula work?
11. How do you check color compatibility?
12. How do you prevent outfit repetition?
13. What happens if the user has no footwear?
14. Why is AI not used in this version?
15. Does the app work offline?
16. How is the app made compatible with iOS and Android?
17. What happens if a user deletes an item used in a saved outfit?
18. What are the limitations and future improvements?

## 15.3 Demonstration sequence

Use this order during evaluation:

1.  Open Home.
2.  Open Wardrobe.
3.  Add a clothing photo using camera or gallery.
4.  Manually enter its attributes.
5.  Add at least one topwear and one bottomwear item.
6.  Open Discover.
7.  Select occasion, weather, and style.
8.  Generate recommendations.
9.  Explain one outfit's score and compatibility reasons.
10. Save an outfit.
11. Mark it as worn.
12. Show Saved Outfits and Outfit History.
13. Close and reopen the app to demonstrate persistence.

Prepare sample wardrobe data before the evaluation so the recommendation
screen is not empty.

------------------------------------------------------------------------

# 16. Definition of done

The initial StyleMate release is complete only when all of the following
are true:

-   [ ] React Native + Expo project runs.
-   [ ] JavaScript is used for application code.
-   [ ] Expo Router navigation works.
-   [ ] Home, Wardrobe, Discover, and Profile screens exist.
-   [ ] Camera photo selection works on supported devices.
-   [ ] Gallery photo selection works.
-   [ ] Clothing attributes can be entered manually.
-   [ ] Clothing can be created, viewed, edited, and deleted.
-   [ ] Images are stored persistently on-device.
-   [ ] SQLite records persist after app restart.
-   [ ] Occasion selection works.
-   [ ] Manual weather selection works.
-   [ ] Style selection works.
-   [ ] Rule-based outfit combinations are generated.
-   [ ] Color compatibility is evaluated.
-   [ ] Outfit scores are calculated out of 100.
-   [ ] Up to three unique recommendations are displayed.
-   [ ] Recommendation explanations are displayed.
-   [ ] Favorites persist.
-   [ ] Outfit history persists.
-   [ ] Recent repetition affects ranking.
-   [ ] Empty and error states are handled.
-   [ ] Core recommendation logic is tested.
-   [ ] iOS and Android compatibility is verified to the extent
    available.
-   [ ] README and architecture documentation are complete.
-   [ ] `PROJECT_STATUS.md` accurately records completed work and
    remaining limitations.
-   [ ] No AI, backend, authentication, weather API, or out-of-scope
    feature has been added.

------------------------------------------------------------------------

# 17. Required project status tracking

Create and maintain `PROJECT_STATUS.md` from Phase 0 onward.

Use this format:

``` md
# StyleMate Project Status

## Current phase
Phase 0 — Repository inspection and project foundation

## Overall status
Not started

## Completed
- [ ] Repository inspected
- [ ] Expo project configured
- [ ] Navigation configured

## Verification performed
- Commands run:
- Platforms tested:
- Results:

## Known issues
- None recorded yet.

## Decisions / assumptions
- Record any implementation detail that needed a reasonable default.

## Next action
- State the next concrete task.
```

Update it after every phase. Keep completed items factual. Never mark a
feature complete solely because its code was written; verify it.

------------------------------------------------------------------------

# 18. Final instruction to Codex

Begin with **Phase 0 only**.

First inspect the current repository, identify whether it is empty or
contains existing work, and report the findings. Then implement the
foundation for Phase 0 without jumping ahead to wardrobe CRUD, SQLite,
or recommendations.

Once Phase 0 is implemented:

1.  run the available checks;
2.  verify the Expo app starts;
3.  inspect the changed files;
4.  update `PROJECT_STATUS.md`;
5.  summarize what was completed, what was tested, any known issues, and
    the exact next phase.

Wait for the user's review before proceeding to the next phase unless
the user explicitly instructs you to continue through multiple phases.

**Remember:** StyleMate's first release is a minimal, offline-first,
rule-based wardrobe assistant for iOS and Android. Manual clothing
attributes, camera/gallery image input, local SQLite persistence, and
explainable outfit scoring are the agreed scope. AI recognition is
future scope only, not part of this implementation.
