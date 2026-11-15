# OSMAR least-privilege administration

This migration introduces the database foundation for delegated, scoped administrator access.

## Owner boundary
- The designated OSMAR owner identity remains immutable and cannot be delegated, replaced, or revoked through these RPCs.
- Only that owner can list, assign, update, or revoke delegated administrator assignments.
- Delegated administrators cannot grant permissions to themselves or other users.

## Role catalogue
- `engineering`: code and release engineering
- `infrastructure_security`: infrastructure and security operations
- `game_operations`: game configuration and events
- `membership_support`: member directory, approvals, and invitations
- `rewards_moderator`: rewards review and awards
- `content_moderator`: multilingual content moderation
- `auditor`: read-only reports and audit access

## Permission vocabulary
`code.read`, `code.write`, `deploy.manage`, `infrastructure.manage`,
`security.audit`, `members.read`, `members.approve`, `invites.manage`,
`game.configure`, `events.manage`, `rewards.review`, `rewards.award`,
`content.manage`, `reports.read`, `audit.read`.

Role labels are descriptive only; actual access is the explicit permission array.
Assignments can expire and can be revoked. Every assignment change is written to a private audit table.

## Important rollout boundary
This is the database RBAC foundation, not a complete rollout. Existing admin RPCs and frontend routes still use the legacy `app_metadata.role = 'osmar_admin'` gate until each operation is migrated to call `private.osmar_has_permission()`. Do not grant delegated roles for production use until those operation-level checks and the admin UI are completed and tested. This deliberate fail-closed boundary prevents a partially migrated role from accidentally inheriting owner-level access.

The assignment tables live in the non-exposed `private` schema and have no client table grants. Management is only through owner-checked RPCs.
