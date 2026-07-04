# TaskJar Interface System

## Product Identity

TaskJar is a quiet focus ritual, not a task dashboard. The core experience is collecting task slips in time-boxed jars and drawing one next step when the user does not want to decide.

Preserve these signals:

- The central question: "What should I do next?"
- The jar/slip metaphor.
- The draw mechanic as the primary action.
- Time-boxed jars such as "5 minutes" and "15 minutes".
- Minimal navigation. Jar management should feel secondary to drawing.

## Visual Direction

Use warm paper surfaces, dark ink text, muted jar green, and restrained red/blue bloom from the original app. Keep the interface calm and tactile, with soft card lift and low-contrast borders. Avoid marketing-style sections, heavy dashboard chrome, and one-hue palettes.

## Layout Rules

- The draw surface is the first screen and emotional center.
- Jar management belongs in a compact right rail on desktop and a stacked section on mobile.
- Keep cards at 8px radius or less.
- Avoid nested cards. Jar cards can exist, but page sections should be full-width or unframed.
- Buttons should be stable in size and readable on small screens.

## Interaction Rules

- Destructive jar actions require confirmation.
- Completing a drawn task should be reversible with a short-lived undo.
- Adding a task should target a specific jar.
- Empty states should guide the next action without blaming the user.
- Icon-only controls need accessible labels.
