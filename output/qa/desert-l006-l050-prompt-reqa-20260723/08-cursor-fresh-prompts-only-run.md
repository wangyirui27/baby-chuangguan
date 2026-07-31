# PASS

Card: Cursor Auto — fresh `--prompts-only` reproduction + zero provider side-effect proof  
Seat: Cursor Auto  
Workspace: `/tmp/baobao-chuangguan` → `/Users/yr/宝宝闯关`  
Version under test: `reqa-cursor-20260723`  
Scope: Phase A (pre-generation / prompts-only dry-run) only. **Not** Phase B release unlock.

## Verdict

Phase A fresh reproduction: **PASS**.  
- 45/45 `prompt-ready`, summary `failed: 0`  
- version 下 **0 mp4 / 0 run-command.sh / 0 production `manifest.json`**  
- approval 45/45: `dryRun=true`, `approved=false`, independent QA 未过, execution 未批, userAcceptance 未接受, evidence 全 false, `creditsBurned=false`  
- 未跑 `--run-libtv`；未改 `script.js` / `tools/video-prompts/**` / 既有 r2|r3 prompt·manifest  

Phase B release: **未声称 / 未解锁**。结构 PASS ≠ 可发布。本卡只证明生成器 prompts-only 路径可复现且无付费副作用。

## Commands actually run

### 1) Fresh prompts-only dry-run

```bash
cd /tmp/baobao-chuangguan
node tools/video-prompts/generate-desert-video-batch.js --start 6 --end 50 --version reqa-cursor-20260723 --prompts-only
```

Exit code: `0`  
Runtime: ~1341 ms  

Stdout last line (authoritative):

```json
{"summary":"output/media-production/desert-levels-006-050-reqa-cursor-20260723-summary.json","completed":45,"failed":0}
```

Every level line emitted `status":"prompt-ready"` with `approval.approved:false`, `creditsBurned:false`, `independent_prompt_qa:false`. Sample L006 / L050 present in stream; no `failed` status lines observed.

### 2) Semantic gate unit tests

```bash
cd /tmp/baobao-chuangguan
node --test tools/video-prompts/desert-semantic-xhigh.test.mjs
```

Exit code: `0`

```
# tests 26
# pass 26
# fail 0
# duration_ms 268.763
```

### 3) Quiz suite (time sufficient)

```bash
cd /tmp/baobao-chuangguan
node --test --test-force-exit quiz.test.js
```
