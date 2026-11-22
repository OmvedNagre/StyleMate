# Demonstration and viva guide

## Preparation

Use a tested device/build once the native matrix is completed. Keep two real clothing photos ready: one top and one bottom. For a quick UI demonstration, Profile can add labeled sample illustrations; explicitly identify these as demo assets. Ensure at least two tops and two bottoms are present for multiple results. No accounts or API keys are needed.

Actual device testing has not yet been performed in the development environment. Do not present this script as evidence that its steps have passed.

## 5–10 minute demonstration

1. **Home (30 seconds):** explain the goal—rediscover owned clothes and reduce daily outfit decisions.
2. **Wardrobe (1 minute):** show category filtering and item details. Explain manually entered attributes.
3. **Add Clothing (1 minute):** take/select a photo, preview it, enter attributes and save. Explain that the picker URI is copied to durable app storage.
4. **Discover (1 minute):** select occasion, weather and style. Emphasize that weather is manual. Generate up to three results.
5. **Explain one score (1 minute):** show the five component reasons. Explain the 100-point example below and the bounded candidate search.
6. **Save and wear (1 minute):** save an outfit, mark it worn, open Saved Outfits and History. Cancel Wear again, then confirm it and verify one additional entry.
7. **Failure resilience (1 minute):** remove a sample item used by a saved outfit. Show missing-item text and retained history. Avoid deleting valuable personal data for the demo.
8. **Persistence (1 minute):** terminate/reopen and show stored clothing, images, favorites and history. Demonstrate offline generation only on an installed build that has been tested offline.

## Worked score

A casual navy top and casual white bottom, both all-season, selected for college, normal weather, any style, and no recent history:

| Criterion | Score | Reason |
| --- | --- | --- |
| Occasion | 30/30 | Casual is strongly compatible with college |
| Color | 30/30 | Navy/white is a preferred pair |
| Weather | 20/20 | Both garments are all-season |
| Style | 10/10 | Any style imposes no penalty |
| Repetition | 10/10 | No exact wear recorded in the last seven days |
| Total | 100/100 | Sum of components |

If this exact combination was worn yesterday, repetition becomes 0 and the total is 90. A different outfit may then rank higher. Optional items can change the average occasion/style score, so this worked example intentionally contains only two pieces.

## Viva questions and concise answers

1. **What problem does StyleMate solve?** It helps people catalog clothing they own and find combinations suited to a selected context.
2. **Why React Native?** One shared JavaScript application targets native iOS and Android interfaces.
3. **What does Expo provide?** Compatible runtime/tooling and modules for image picking, files and SQLite.
4. **How does navigation work?** Expo Router maps files under `src/app` to routes. Four tabs organize the main areas; stack routes handle details and forms.
5. **How do camera/gallery inputs work?** Expo Image Picker opens the system interface. Permission is handled on action; cancellation is normal.
6. **Why copy selected images?** Picker/cache paths may be temporary. Copies under private app documents storage are intended to survive restarts.
7. **Why SQLite?** It provides local relational storage, transactions and parameterized queries without a server.
8. **What is CRUD?** Create, read, update and delete—the wardrobe's basic record operations.
9. **What is rule-based recommendation?** Explicit compatibility rules generate and score combinations; no model is trained or called.
10. **How is the score calculated?** Occasion 30, color 30, weather 20, style 10 and repetition 10. Each component is bounded and the sum is an integer.
11. **How does color matching work?** A small symmetric preferred-pair map and neutral-color rules score the top/bottom combination. Unknown colors receive a neutral score.
12. **How is repetition reduced?** Exact unordered garment-ID sets in recent history lose repetition points within three or seven days.
13. **What if no shoes exist?** Footwear is optional. A top/bottom pair remains valid and the explanation states the omission.
14. **Why no AI?** The agreed first release prioritizes transparent, testable rules and offline use. Recognition is future scope only.
15. **Does it work offline?** Core algorithms and storage make no network calls. Installed-build offline operation still needs native verification; Metro development requires connectivity.
16. **How is cross-platform support handled?** Shared components and Expo APIs, safe areas and scrollable forms. Both targets export; device acceptance remains pending.
17. **What happens after deletion?** The record is removed transactionally and owned-image cleanup is queued. Saved/history text survives; missing photos use a fallback.
18. **What are the limits?** Heuristic matching, bounded search, manual attributes/weather, no cloud backup, pending native testing and possible orphan files after interrupted saves.
19. **How are duplicate wears avoided?** In-flight guards prevent repeated taps; previously worn outfits require explicit repeat confirmation. SQLite request IDs make repeated inserts idempotent.
20. **How was it tested?** 77 automated tests cover UI behavior, scoring, image-service boundaries and real host SQLite. Lint/type checks and mobile exports pass. These do not substitute for native hardware tests.

## Future scope

Only with separate approval: optional AI attribute prefilling, still editable by the user and never required for core use. Backup/export could also be considered separately. Neither feature is implemented. Do not claim recognition, cloud sync, or full device certification in the presentation.
