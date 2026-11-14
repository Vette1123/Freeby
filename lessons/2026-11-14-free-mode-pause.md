# A free-mode pause kept the customer, not their Pro

## What

Lemon Squeezy pauses a subscription in one of two modes, in `pause.mode`: `void` (no service, no charge) and `free` (service continues, no charge). The webhook read only `status`, so every `paused` subscription mapped to `paused` and the customer dropped to Free, including the ones the store meant to keep serving. `mapLsStatus(status, pauseMode)` now maps a `free`-mode pause to `active`; the webhook passes `attrs.pause?.mode`. No schema change: Lemon Squeezy sends `subscription_unpaused` or `subscription_updated` when the pause ends, and the row is rewritten then.

## Mistakes

- The 11-11 billing fix and its write-up both treated `paused` as one state. A reader of the article on Medium pointed out the `free` mode. The status table was written from the status list, not from the subscription object's fields.

## What worked

- Mapping a free pause onto an existing access status instead of adding a stored `pauseMode` column. The "status sources agree" test still holds unchanged.

## Rules

- Before deciding access from a vendor status, read the whole subscription object for fields that qualify that status (`pause.mode`, `cancelled`, `ends_at`).
