# Cursor Review — L005 Nice to meet you

Seat: Cursor (read-only)
Prompt: `tools/video-prompts/desert-level-005-nice-to-meet-you-v1.txt`
Target: Nice to meet you / 很高兴见到你
Checker: `ok:true` (targetCount 16, 5 dialogue lines, 7349 chars)
Date: 2026-07-23

---

## PASS

- **strongest reason:** Prompt locks contract anchors for Nice to meet you: children start apart on left/right paths, shy first-meeting pause, empty-handed gentle handshake as main action, explicit “not just a hello greeting / only waving” ban. Muted / 巴拉巴拉 viewer still gets first-time meeting from picture plan, not smile-wave Hello.

### Criterion checklist

| # | Check | Verdict |
|---|---|---|
| 1 | Unknown-language / silent visual teach | PASS — paths + shy stop + handshake = first meeting |
| 2 | Distinguish from Hello/Hi | PASS — handshake + unfamiliar approach, wave banned as main action |
| 3 | Semantic anchors (all 4) | PASS — present in Visual semantic anchors + Story Container + Scene |
| 4 | Face/mouth front or front-¾ | PASS on text — every beat + Camera + Negative ban back/profile |
| 5 | Negative: text/classroom/props/holding | PASS — covered |
| 6 | Seedance highest risk | HIGH — Dialogue timing vs handshake (see below) |

### Highest Seedance risk

**Ambiguity:** Timed Dialogue lets first spoken line fire before handshake cue is locked.

Exact weak sentence:

> `0-3s: Child A, front-three-quarter face visible, shy smile: "Nice to meet you."`

Story Container couples “offers empty hand … and says”, but beat 0-3s only names shy smile. Seedance often follows timed Dialogue over prose → first 3s can read as Hello/Hi under unknown-language test. Secondary: opposite-path meet + handshake pulls faces into pure side-profile despite Camera bans.

### High-risk fixes (optional before gen; not blocking PASS)

1. Change `0-3s: Child A, front-three-quarter face visible, shy smile: "Nice to meet you."` → `0-3s: Child A, front-three-quarter face visible, empty hand already offered for handshake after last step from left path, shy smile: "Nice to meet you."`
2. Change Camera sentence `Keep faces, upper bodies, empty hands, the handshake, and the two paths visible.` → `Keep faces, upper bodies, empty hands, the center handshake, AND both left+right converging paths visible in every beat; bodies angled ~45° so faces stay front-three-quarter to camera during handshake — never pure side-profile.`
3. Change `12-15s: Both children, new friends standing together: "Nice to meet you!"` → `12-15s: Both still front-three-quarter, handshake just finishing or still lightly held, warm quiet smiles as new friends; speak once together only if both mouths clearly visible — no presenter/chorus pose.`

### Contact sheet QA (one line)

Mute contact sheet: reject unless every speech beat shows front/front-¾ face+mouth AND (across clip) left+right path approach + empty-handed center handshake — no wave-only Hello, no profile/back speaking, no classroom/text/props.
