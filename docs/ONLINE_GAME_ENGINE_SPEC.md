# Family World Online Games — Domino + Ludo Foundation

**Decision:** Public launch only after cross-device gameplay, security, data-integrity, and mobile acceptance tests pass. Domino and Ludo are parallel P0 tracks.

## Current verified baseline

- Trusted-member authentication and invitation flow exist.
- Domino room and room-player tables, create/join/leave RPCs, and a Realtime lobby exist.
- The current Domino lobby is waiting-room functionality only. It is not a synchronized match engine.
- `game_sessions` currently records local practice as `local_practice_self_reported`; those records are not verified online results.
- The app has a web manifest and service worker foundation, but update UX and device QA still need completion.
- Ludo is currently a catalog placeholder, not a playable online game.

Do not market any of the above incomplete capabilities as production multiplayer.

## Shared architecture

### Trust boundaries

1. The browser is an untrusted input device. It may request an action; it never decides dice values, tile ownership, legal moves, score, winner, or final duration.
2. PostgreSQL RPCs are the authoritative game engine. Each action runs in one transaction and locks the match row.
3. Public state is intentionally minimal. Private player state is fetched only by that player through an authenticated RPC.
4. Realtime is a notification/transport layer, not the source of truth. After a notification or reconnect, clients fetch the authoritative snapshot.
5. Only the server finalization routine may write verified online outcomes. Local practice stays separately labeled.
6. Every action includes an idempotency UUID and expected state version. Duplicate and stale requests must not mutate state.

### Suggested persistence model

Use private-schema tables for authoritative state and action logs, not directly exposed client tables:

- `private.online_matches`: id, game_id (domino/ludo), room_code, host_id, status, settings, state_version, public_state, created_at, started_at, finished_at, last_action_at.
- `private.online_match_players`: match_id, user_id, seat, membership_code snapshot, joined_at, connection/ready metadata.
- `private.online_match_private_state`: match_id, user_id, encrypted/isolated per-player JSON state (e.g. Domino hand); never include this in public snapshots.
- `private.online_match_actions`: match_id, action_id unique per match, actor_id, expected_version, action_type, accepted, resulting_version, created_at, rejection_code.
- `private.online_match_results`: match_id, user_id, outcome, score, duration_seconds, finalized_at; unique(match_id,user_id).

All tables must have RLS enabled. Revoke direct client writes to authoritative tables. Grant only narrowly scoped RPC execution to authenticated users. Avoid exposing SECURITY DEFINER functions in the public schema unless the established project pattern requires it; pin an empty search_path, fully qualify objects, validate auth.uid(), and perform explicit authorization in every function.

### Shared RPC contract

- `create_online_match(game_id, settings)`: requires active trusted membership; validates settings; allocates host seat.
- `join_online_match(room_code)`: requires active trusted membership; locks room; allocates one available seat atomically.
- `get_online_match_snapshot(match_id)`: returns public state plus only the caller's private state.
- `submit_online_match_action(match_id, action_id, expected_version, action)`: validates membership, turn, phase, action shape and game-specific legality; locks match; rejects stale/replayed actions; applies state transition; increments version; emits a minimal notification.
- `leave_or_reconnect_online_match(match_id, intent)`: supports safe reconnect and pre-match leave; in-match leave follows explicit timeout/forfeit rules.
- `finalize_online_match(match_id)`: internal-only routine; calculates results from authoritative state and inserts one result per participant idempotently.

Never let clients call a generic finalization routine or submit result fields.

## Domino engine specification

- Standard double-six set: 28 unique tiles, shuffled server-side.
- Deal hands server-side. Keep each hand in per-player private state; expose only the caller's hand.
- Public state: player seats, current turn, board chain/open ends, boneyard count, pass state, scores, round status, version.
- Action types: `play_tile(tile_id, side)`, `draw_tile`, `pass_turn`.
- Validate ownership, matching pips, correct side, turn, boneyard rules, and whether a pass is legal.
- Handle first move, doubles/orientation, blocked game, empty hand, scoring, teams vs solo, target score and one-round settings.
- Resolve winners and score server-side. No client-supplied score or winner.
- Define deterministic tie/blocked-game rules in code and test them.

## Ludo engine specification

- Default classic rules must be documented before release: 4 tokens per player, dice 1–6, six-to-enter, extra turn policy, safe squares, captures, home lane, exact finish, and turn order.
- Generate dice with server-side cryptographically secure randomness. Clients send only a roll request.
- Public state: seats/colors, token positions, current turn, dice result, legal token IDs, captures, phase, version.
- Action types: `roll_dice`, `move_token(token_id)`.
- Validate the roll/move phase, actor turn, token eligibility, six-to-enter, exact finish, safe-square/capture rules, and extra-turn policy.
- Compute every token movement and winner server-side. Reject client-provided dice, positions, captures, score, or winner.

## Realtime and reconnect

- Use private, authorization-protected channels scoped to a match.
- Broadcast only match ID, new state version, event type, and safe public summary. Never broadcast a Domino hand or secrets.
- Set/refresh Realtime auth before joining private channels.
- Reconnect by fetching the current snapshot and comparing state_version; never replay untrusted client-side state as authoritative.
- Treat Realtime messages as hints; persisted state is canonical.

## Verified results and dashboards

- Preserve existing `local_practice_self_reported` rows and label them as practice.
- Add a distinct server-generated source for online verified results.
- One unique result per (match_id,user_id); finalization must be idempotent.
- A member dashboard must show Local Practice and Verified Online separately.
- Admin aggregates must not mix game results with employee productivity, performance reviews, compensation, or OSMAR PMO evaluation.
- No wagering, cash-out, or monetary interpretation of FWP points.

## Mobile PWA

- Verify manifest, icons, service worker scope, and GitHub Pages base path.
- Add update detection and a user-visible reload action. Never force reload during an active match.
- Version caches per release; remove old caches only after the new worker activates.
- Offline mode may serve the shell but must clearly disable matchmaking and online moves.
- Test Android Chrome install/update and iOS Safari Add to Home Screen.
- A PWA install is not equivalent to Google Play/App Store distribution.

## Public launch gates (all required)

- [ ] Domino 2–4 player end-to-end test across separate devices.
- [ ] Ludo 2–4 player end-to-end test across separate devices.
- [ ] Identical public state and turn on every client.
- [ ] Illegal, out-of-turn, forged, stale, and replayed actions rejected.
- [ ] Opponents cannot read private hands or internal state.
- [ ] Reload/reconnect restores authoritative state.
- [ ] Verified results written once and displayed separately from practice.
- [ ] RLS, RPC authorization, Realtime authorization, and security advisor review complete.
- [ ] Arabic, English, Simplified Chinese and mobile touch QA complete.
- [ ] PWA installation/update smoke tests pass.
- [ ] Privacy policy, community rules, child-safety/guardian flow, moderation/reporting and support contact are ready.
- [ ] Load, backup/restore, and incident-response checks completed.

**Release rule:** No public invitation campaign and no “online-ready” claim until every required gate is checked and a release candidate is approved.
