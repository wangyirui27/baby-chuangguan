# Codex browser 六层 contract attach 报告

日期：2026-07-23  
工作区：`/Users/yr/宝宝闯关`  
真相源：`/Users/yr/宝宝闯关/output/qa/desert-l006-l050-prompt-reqa-20260723/11-hermes-final-verdict.md`

## 结论

PASS：已修复 `script.js` 里浏览器侧 L006-L050 只能保持 `missing` 的问题。

现在：

- Node 环境仍优先走 `/Users/yr/宝宝闯关/tools/video-prompts/lib/attach-desert-semantic-contracts.js`。
- 浏览器无 `module` / `require` 时，读取预加载的 `/Users/yr/宝宝闯关/tools/video-prompts/lib/desert-level-semantic-contracts-l006-l050.browser.js`。
- VM 离线测试已证明 L006 / L013 / L050 的 `spokenDialogue.status` 与 `visualSemantics.status` 都是 `authored`。
- `/Users/yr/宝宝闯关/script.js` 现有 `module.exports` 测试导出未破坏，`quiz.test.js` 95/95 通过。

## 改动文件

- `/Users/yr/宝宝闯关/tools/video-prompts/lib/desert-level-semantic-contracts-l006-l050.browser.js`
  - 从 `/Users/yr/宝宝闯关/tools/video-prompts/desert-level-semantic-contracts-l006-l050.json` 生成。
  - 挂载 `globalThis.DESERT_LEVEL_SEMANTIC_CONTRACTS_L006_L050`，CommonJS 下也可 `module.exports`。
- `/Users/yr/宝宝闯关/script.js`
  - 保留 Node `require('./tools/video-prompts/lib/attach-desert-semantic-contracts.js')` 路径。
  - 无 `require` 时从 browser bundle payload attach 六层字段。
  - 同步 SW 注册版本到 `20260723-desert-six-layer-v1`。
- `/Users/yr/宝宝闯关/index.html`
  - 在 `script.js` 前加载 browser contract bundle。
- `/Users/yr/宝宝闯关/sw.js`
  - 缓存名更新为 `baby-island-shell-20260723-desert-six-layer-v1`。
  - 预缓存 browser contract bundle 与新版 `script.js`。
- `/Users/yr/宝宝闯关/tools/pack-app-www.sh`
  - App www 打包只额外复制该 contract bundle 单文件。
  - 继续排除 `assets/video/**` 课程视频。
- `/Users/yr/宝宝闯关/tools/video-prompts/desert-semantic-xhigh.test.mjs`
  - 新增浏览器 VM 无 `module` / `require` 的离线回归测试。
- `/Users/yr/宝宝闯关/quiz.test.js`
  - 同步 shell/cache 版本断言，并断言 bundle 被 HTML/SW 引用。

## 已运行命令

```bash
rtk proxy node --test tools/video-prompts/desert-semantic-xhigh.test.mjs
```

结果：PASS，28/28。

```bash
rtk proxy node --test --test-force-exit quiz.test.js
```

结果：PASS，95/95。

```bash
rtk proxy bash tools/pack-app-www.sh /tmp/baobao-six-layer-www
```

结果：PASS；输出 `/tmp/baobao-six-layer-www`，报告 `course videos excluded (assets/video)`。

```bash
rtk proxy stat -f %z /tmp/baobao-six-layer-www/tools/video-prompts/lib/desert-level-semantic-contracts-l006-l050.browser.js
```

结果：`83474` bytes。

```bash
rtk proxy find /tmp/baobao-six-layer-www/assets -path '*/video/*' -type f -print -quit
```

结果：无输出，未发现打包进 App www 的课程视频文件。

## 边界说明

- 未执行 `--run-libtv`。
- 未执行任何付费生成。
- 未写入或伪造 `yr` 的 `executionApproval`。
- 未把 single-sample 限制改成多关运行。
- 未把 `structure PASS` 写成 release PASS。
- 本卡只修复 browser 六层 attach blocker；DELETE 关 L013/L014/L030/L031/L048 的生成队列/内容处理仍以 must-rewrite/remove 门禁为准，不能因本卡直接发布或批量付费生成。
