# 豆包（火山引擎）TTS API 规格说明

> **文档版本**: 1.1  
> **更新日期**: 2025-07-15  
> **变更说明**: v1.1 补齐请求体字段 `extra_param` / `disable_emoji_filter`；QPS 与并发章节明确区分供应商配额（QuotaMonitoring 实读）与项目限流建议。  
> **适用场景**: 宝宝闯关 · 预录单词发音批量生成  
> **密钥安全声明**: 本文档不含任何真实凭据。所有示例中的 App ID / Token 值均为占位符。

---

## 目录

1. [接口端点](#1-接口端点)
2. [鉴权方式](#2-鉴权方式)
3. [HTTP 请求头](#3-http-请求头)
4. [请求体 JSON 字段清单](#4-请求体-json-字段清单)
5. [请求示例](#5-请求示例)
6. [返回字段含义](#6-返回字段含义)
7. [返回示例](#7-返回示例)
8. [错误码表](#8-错误码表)
9. [推荐音频格式与采样率](#9-推荐音频格式与采样率)
10. [QPS 与并发上限](#10-qps-与并发上限)
11. [环境变量映射](#11-环境变量映射)
12. [`.env.example` 模板建议](#12-envexample-模板建议)
13. [关键注意事项](#13-关键注意事项)
14. [信息来源](#14-信息来源)

---

## 1. 接口端点

本项目使用 **HTTP 非流式接口**（一次性合成，适合批量预录）。

| 协议 | 端点 URL | 说明 |
|------|---------|------|
| **HTTP（推荐）** | `https://openspeech.bytedance.com/api/v1/tts` | 非流式合成，POST JSON，一次性返回 base64 音频 |
| WebSocket（备选） | `wss://openspeech.bytedance.com/api/v1/tts/ws_binary` | 二进制协议，流式合成，适合实时播放 |

> **本项目选择 HTTP 的原因**：批量预录 300 个短词不需要流式低延迟；HTTP 接口实现简单、调试方便、无需处理二进制帧协议。

---

## 2. 鉴权方式

### 2.1 Bearer Token 认证

火山引擎 TTS 采用 **Bearer Token** 认证，通过 HTTP Header 传递：

```
Authorization: Bearer;${token}
```

> ⚠️ **关键细节**：`Bearer` 和 `${token}` 之间使用**分号 `;`** 分隔，不是空格。这是火山引擎特有的格式，与标准 OAuth2 的 `Bearer <token>`（空格分隔）不同。替换时请勿保留 `${}` 大括号。

### 2.2 凭据获取

在[火山引擎控制台](https://console.volcengine.com/speech/app)创建应用后，获取以下参数：

| 参数 | 获取位置 | 说明 |
|------|---------|------|
| **App ID** | 控制台 → 应用管理 → 应用详情 | 应用唯一标识 |
| **Access Token** | 控制台 → 应用管理 → 应用详情 | 访问令牌，用于 Bearer 认证 |
| **Cluster** | 控制台 → 应用管理 → 服务信息 | 业务集群标识，区分标准音色 / 大模型音色 / 复刻音色 |
| **Secret Key** | 控制台 → 应用管理 → 应用详情 | 仅 SDK 鉴权使用，HTTP 接口不需要 |

### 2.3 Token 有效期与刷新

| 属性 | 值 |
|------|-----|
| **Token 类型** | 静态 Access Token（长期有效） |
| **过期时间** | **无过期时间** — Access Token 是永久有效的，只要应用未被删除 / 服务未被关停 |
| **刷新方式** | **无需自动刷新** — Token 为静态凭证，不存在 OAuth2 式的 refresh token 机制 |
| **失效条件** | ① 应用被删除；② 账号欠费导致服务关停（欠费 2 小时后关停，168 小时未补缴则回收） |
| **重新获取** | 如 Token 失效或被重置，到控制台应用详情页重新复制 Access Token 值，更新 `.env` 即可 |

> **实现建议**：后端代码直接从环境变量读取 Token，无需实现 Token 刷新/轮换逻辑。Token 值变化时只需更新 `.env` 文件并重启服务。

### 2.4 请求体中的 Token 字段

请求体 `app.token` 字段也需要传入 Token 值，但该字段**可传入任意非空值** — 真正的鉴权发生在 HTTP Header 的 `Authorization` 中。请求体中的 `token` 字段仅用于日志追溯，不影响鉴权结果。

---

## 3. HTTP 请求头

```
POST /api/v1/tts HTTP/1.1
Host: openspeech.bytedance.com
Content-Type: application/json
Authorization: Bearer;{在此填入 Access Token}
```

| Header | 值 | 必填 | 说明 |
|--------|-----|------|------|
| `Content-Type` | `application/json` | ✅ | 请求体为 JSON 格式 |
| `Authorization` | `Bearer;{token}` | ✅ | Bearer 认证，分号分隔 |

> 注意：火山引擎 TTS **不需要** `X-Api-Key` 或 `Resource-Id` 头（这些是 Ark 大模型平台的要求，不是语音合成服务的要求）。

---

## 4. 请求体 JSON 字段清单

请求体为 JSON 对象，包含 4 个一级节点：`app`、`user`、`audio`、`request`。

### 4.1 `app` — 应用相关配置

| 字段 | 层级 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `appid` | 2 | string | ✅ | 应用标识，从控制台获取 |
| `token` | 2 | string | ✅ | 应用令牌，可传任意非空值（实际鉴权在 Header） |
| `cluster` | 2 | string | ✅ | 业务集群。标准音色用 `volcano_tts`，大模型音色用 `volcano_mega`，复刻音色见控制台 |

### 4.2 `user` — 用户相关配置

| 字段 | 层级 | 类型 | 必填 | 说明 |
|------|------|------|------|------|
| `uid` | 2 | string | ✅ | 用户标识，可传任意非空值，用于服务端日志追溯 |

### 4.3 `audio` — 音频相关配置

| 字段 | 层级 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| `voice_type` | 2 | string | ✅ | — | 音色类型标识，如 `BV700_streaming`；复刻音色使用 Speaker ID |
| `encoding` | 2 | string | ❌ | `pcm` | 音频编码格式：`mp3` / `wav` / `pcm` / `ogg_opus` |
| `rate` | 2 | int | ❌ | `24000` | 音频采样率，可选 `8000` / `16000` / `24000` |
| `speed_ratio` | 2 | float | ❌ | `1.0` | 语速，范围 `[0.2, 3.0]` |
| `volume_ratio` | 2 | float | ❌ | `1.0` | 音量，范围 `[0.1, 3.0]` |
| `pitch_ratio` | 2 | float | ❌ | `1.0` | 音高，范围 `[0.1, 3.0]` |
| `compression_rate` | 2 | int | ❌ | `1` | opus 格式压缩比，范围 `[1, 20]` |
| `emotion` | 2 | string | ❌ | — | 情感/风格标签 |
| `language` | 2 | string | ❌ | — | 语言类型，多语种音色需指定 |

### 4.4 `request` — 请求相关配置

| 字段 | 层级 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| `reqid` | 2 | string | ✅ | — | 请求唯一标识，建议使用 UUID，每次调用必须唯一 |
| `text` | 2 | string | ✅ | — | 合成文本，UTF-8 编码，长度限制 **1024 字节** |
| `operation` | 2 | string | ✅ | — | 操作类型：`query`（非流式，HTTP 仅支持此值）/ `submit`（流式） |
| `text_type` | 2 | string | ❌ | `plain` | 文本类型：`plain` / `ssml` |
| `silence_duration` | 2 | int | ❌ | `125` | 句尾静音时长，单位 ms |
| `with_frontend` | 2 | int/string | ❌ | — | 设为 `1` 且 `frontend_type` 为 `unitTson` 时返回音素级时间戳 |
| `frontend_type` | 2 | int/string | ❌ | — | 配合 `with_frontend` 使用，值为 `unitTson` |
| `with_timestamp` | 2 | int/string | ❌ | — | 设为 `1` 启用新版时间戳（保留原文数字/符号） |
| `pure_english_opt` | 2 | int/string | ❌ | — | 设为 `1` 时中文音色读纯英文可正确处理阿拉伯数字 |
| `split_sentence` | 2 | int/string | ❌ | — | 复刻音色语速优化，设为 `1` 可优化语速过快 |
| `extra_param` | 2 | string(JSON) | ❌ | — | 附加功能参数，**值为 JSON 字符串**（序列化后的对象，非裸对象），承载 `disable_emoji_filter` 等子开关。见下方 4.5 |

### 4.5 `extra_param` — 附加功能参数（`request` 子节点）

> ⚠️ **实现陷阱**：`extra_param` 的值是一个 **JSON 字符串**，即把对象用 `JSON.stringify()` / `json.dumps()` 序列化后再放入请求体，**不是**直接写嵌套对象。官方 Python 示例为 `"extra_param": json.dumps({"disable_emoji_filter": True})`。若直接传裸对象会被服务端忽略或报参数错误。

| 字段 | 层级 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|------|--------|------|
| `extra_param` | 2（位于 `request` 内） | string（序列化 JSON） | ❌ | — | 附加功能参数父节点，**值为 JSON 字符串** |
| `disable_emoji_filter` | 3（位于 `extra_param` 内） | bool | ❌ | `false` | 设为 `true` 时，**不在文本中过滤 emoji**，emoji 原样参与合成；建议搭配时间戳参数（`with_timestamp`/`with_frontend`）一起使用 |

`extra_param` 的合法 JSON 示例（已序列化）：

```text
"{\"disable_emoji_filter\": true}"
```

放入请求体的最终形态（注意是字符串值）：

```json
"request": {
    "reqid": "...",
    "text": "I love 🍎",
    "operation": "query",
    "extra_param": "{\"disable_emoji_filter\": true}"
}
```

> **本项目说明**：本项目合成的是英文单词（纯字母，无 emoji），因此**默认不传 `extra_param`**，emoji 会按默认 `false` 被过滤。此处仅作字段完整性记录；若后续词表出现含 emoji 的文案，再启用 `disable_emoji_filter: true`。

---

## 5. 请求示例

### 最小可用请求（本项目批量生成场景）

```json
{
    "app": {
        "appid": "{在此填入 App ID}",
        "token": "{在此填入 Access Token}",
        "cluster": "volcano_tts"
    },
    "user": {
        "uid": "baby_quiz_batch_gen"
    },
    "audio": {
        "voice_type": "{在此填入音色 ID}",
        "encoding": "mp3",
        "rate": 24000,
        "speed_ratio": 1.0,
        "volume_ratio": 1.0,
        "pitch_ratio": 1.0
    },
    "request": {
        "reqid": "{在此生成 UUID}",
        "text": "apple",
        "text_type": "plain",
        "operation": "query",
        "extra_param": "{\"disable_emoji_filter\": true}"
    }
}
```

> 上例中 `extra_param` 为可选字段（本项目词表为纯英文单词，默认可不传）。若不涉及 emoji，删除该行即可；保留时其值必须是**已序列化的 JSON 字符串**。

---

## 6. 返回字段含义

返回为 JSON 对象：

| 字段 | 层级 | 类型 | 说明 |
|------|------|------|------|
| `reqid` | 1 | string | 请求 ID，与传入的 `reqid` 一致 |
| `code` | 1 | int | 状态码，`3000` 表示成功，其他为错误码（见下方错误码表） |
| `message` | 1 | string | 状态信息，成功为 `Success`，失败为错误描述 |
| `operation` | 1 | string | 操作类型，回显请求中的 `operation` |
| `sequence` | 1 | int | 音频段序号，负数表示合成完毕（HTTP 非流式始终为 `-1`） |
| `data` | 1 | string | 合成的音频数据，**base64 编码**。需 base64 解码后写入文件 |
| `addition` | 1 | object | 额外信息父节点 |
| `addition.duration` | 2 | string | 音频时长，单位 ms |
| `addition.frontend` | 2 | string | 时间戳信息（JSON 字符串），包含字级别和音素级别时间戳 |
| `addition.description` | 2 | string | 描述信息 |

---

## 7. 返回示例

### 成功响应

```json
{
    "reqid": "550e8400-e29b-41d4-a716-446655440000",
    "code": 3000,
    "operation": "query",
    "message": "Success",
    "sequence": -1,
    "data": "<base64 编码的 MP3 音频数据>",
    "addition": {
        "duration": "560"
    }
}
```

### 失败响应

```json
{
    "reqid": "550e8400-e29b-41d4-a716-446655440000",
    "code": 3003,
    "message": "quota exceeded for types: concurrency"
}
```

---

## 8. 错误码表

| 错误码 | 描述 | 举例 | 可重试 | 建议行为 |
|--------|------|------|--------|---------|
| **3000** | 请求正确 | 正常合成 | — | 正常处理 |
| **3001** | 无效的请求 | `operation`/`workflow` 等参数值非法 | ❌ | 检查参数配置 |
| **3003** | 并发超限 | 超过在线设置的并发阈值 | ✅ | 指数退避重试；降低并发数 |
| **3005** | 后端服务忙 | 后端服务器负载高 | ✅ | 指数退避重试 |
| **3006** | 服务中断 | 相同 `reqid` 重复请求 | ❌ | 确保 `reqid` 唯一（使用 UUID） |
| **3010** | 文本长度超限 | 单次请求超过文本长度阈值 | ❌ | 检查参数，确保文本 ≤ 1024 字节 |
| **3011** | 无效文本 | 文本为空、仅含标点、语种不匹配 | ❌ | 检查参数，确保文本有效 |
| **3030** | 处理超时 | 单次请求超过服务最长时间限制 | ✅ | 重试或检查文本复杂度 |
| **3031** | 处理错误 | 后端异常 | ✅ | 指数退避重试 |
| **3032** | 等待获取音频超时 | 后端网络异常 | ✅ | 指数退避重试 |
| **3040** | 音色克隆链路网络异常 | 后端网络异常 | ✅ | 重试 |
| **3050** | 音色克隆查询失败 | `voice_type` 代号不正确 | ❌ | 检查 `voice_type` 参数 |

### 常见错误消息对照

| 错误消息 | 原因 | 处置 |
|---------|------|------|
| `quota exceeded for types: xxx_lifetime` | 试用版用量用完 | 开通正式版 |
| `quota exceeded for types: concurrency` | 并发超过限定值 | 降低并发或增购并发 |
| `Fail to feed text, reason Init Engine Instance failed` | `voice_type` / `cluster` 传错 | 检查音色 ID 和集群值 |
| `illegal input text!` | 文本无效（全标点/emoji/语种不匹配） | 检查文本内容 |
| `authenticate request: load grant: requested grant not found` | 鉴权失败 | 检查 `appid` 和 `token` 值，确认 `Authorization` 格式为 `Bearer;{token}` |
| `extract request resource id: get resource id: access denied` | 未拥有该音色授权 | 在控制台购买/开通该音色 |

---

## 9. 推荐音频格式与采样率

### 9.1 音频编码格式

| 格式 | `encoding` 值 | 浏览器兼容性 | 文件大小 | 流式支持 | 推荐场景 |
|------|--------------|-------------|---------|---------|---------|
| **MP3** ⭐ | `mp3` | ✅ 全平台（Chrome/Safari/Firefox/iOS/Android） | 小 | ✅ | **本项目首选** — 全兼容、文件最小 |
| **WAV** | `wav` | ✅ 全平台 | 大（无压缩） | ❌ 不支持流式 | 需要无损音频时使用 |
| **PCM** | `pcm` | ❌ 需自行封装 WAV 头 | 中 | ✅ | 仅适合后端处理，浏览器无法直接播放 |
| **OGG/Opus** | `ogg_opus` | ⚠️ Safari 不支持 | 最小 | ✅ | 非 Apple 平台 / 极致压缩场景 |

> **本项目推荐 MP3**：浏览器原生 `<audio>` 标签全平台兼容；300 个短词 mp3 ≈ 5 MB，适合提交进仓库。

### 9.2 采样率

| 采样率 | `rate` 值 | 音质 | 适用场景 |
|--------|----------|------|---------|
| **24000 Hz** ⭐ | `24000` | 高 | **本项目首选** — 默认值，语音清晰度高，文件适中 |
| **16000 Hz** | `16000` | 中 | 兼容性/带宽受限场景；电话级音质 |
| 8000 Hz | `8000` | 低 | 极低带宽场景，不推荐用于教育发音 |

> **本项目推荐 24000 Hz**：儿童英语启蒙需要清晰发音；24000 Hz 是 API 默认值且文件大小可接受。

---

## 10. QPS 与并发上限

> 🔑 **核心事实**：QPS 与并发的**真实上限不是固定常量**，而是**账号/服务级配额（quota）**，在**开通/购买服务时**确定，并在控制台和 QuotaMonitoring 接口中可见。下文严格区分「供应商配额（事实）」与「本项目限流建议（保守取值）」，批量脚本应以**实际查询到的配额**为准。

### 10.1 供应商配额（事实，需按账号查询）

| 项目 | 含义 | 如何获取真实值 |
|------|------|---------------|
| **并发上限（concurrency limit）** | 同一时刻可进行的合成请求数 | ① 控制台 → 服务开通/购买页可见；② 调用 **QuotaMonitoring API** 读取返回字段 `limit` |
| **QPS 上限** | 每秒允许的请求数 | 同上，控制台开通/购买时确定，QuotaMonitoring `limit` 字段返回 |
| **用量 value** | 当前已用并发/QPS | QuotaMonitoring 返回字段 `value`（可能为 qps 或并发指标） |
| **单次请求超时** | **60 秒**（HTTP 接口硬限制） | 单次合成必须在 60s 内完成；与配额无关 |
| **单次文本长度** | **1024 字节**（UTF-8，标准音色） | 复刻音色无此限制，但受 60s 超时约束 |

> ⚠️ **不要把任何具体数字当成通用硬上限写死在代码里。** 官方文档与社区示例中常见的「默认 10 QPS / 并发 2」只是**试用/常见档位**的参考值；不同账号、不同套餐、不同开通时间的真实 `limit` 不同。批量脚本**必须在运行前查询真实配额**并据此限流。

### 10.2 QuotaMonitoring 接口（查询真实配额的权威途径）

官方提供配额监控接口，可按天/小时/分钟查询账号的实际 QPS/并发用量与上限：

| 项 | 值 |
|----|----|
| 接口地址 | `open.volcengineapi.com` |
| 请求方式 | `GET` |
| Action | `QuotaMonitoring` |
| Version | `2021-08-30` |
| Service / Region | `speech_saas_prod` / `cn-north-1` |
| 鉴权 | 火山引擎 HMAC-SHA256 签名（AK/SK，**与 TTS 的 Bearer Token 不同**） |
| 关键请求参数 | `AppID`（应用 ID）、`ResourceID`（如 `volc.service_type.10029`）、`Start`/`End`（yyyy-MM-dd）、`Mode`（daily/hourly/minutely/5minutely） |
| 关键返回字段 | `data.quota_monitoring[].value`（实际用量，可能为 qps 或并发）、`data.quota_monitoring[].limit`（**配额最大值，即开通/购买时可见的 qps/concurrency 上限**）、`status` |

返回中 `limit` 的官方定义（原文）："quota 的最大值，服务开通和购买时候可见的 qps/concurrency 的值。"

> 文档来源：<https://www.volcengine.com/docs/6561/1476626>
>
> **本接口用于“读”配额，不是 TTS 合成接口本身。** Sprint 2+ 的批量脚本可选地调用一次该接口，把读到的 `limit` 作为运行时限流上限；若不接入此接口，则采用下文 10.3 的保守默认值，并在日志中提示“使用保守默认配额，未校验真实上限”。

### 10.3 超限行为（错误码语义）

| 超限类型 | 触发条件 | 返回 | 是否可重试 |
|---------|---------|------|-----------|
| 并发超限 | 并发数 > 账号 `concurrency` 配额 | `code: 3003`，`message: quota exceeded for types: concurrency` | ✅ 退避后重试 |
| QPS 超限 | 每秒请求数 > 账号 QPS 配额 | 请求被拒绝（4xx 或 quota 相关 message） | ✅ 降低速率后重试 |
| 试用版用量耗尽 | 试用额度用完 | `message: quota exceeded for types: xxx_lifetime` | ❌ 需开通正式版 |

### 10.4 本项目限流建议（保守取值，非供应商硬上限）

> 以下数值是**项目侧的保守建议**，用于在**尚未查询真实配额**或**配额较低**时的安全默认值。若 Sprint 2+ 接入 QuotaMonitoring 读到更高的 `limit`，应优先采用真实值并相应上调。

| 参数 | 保守建议值 | 性质 | 理由 |
|------|-----------|------|------|
| 批量脚本最大并发 | **5**（或 `min(5, 真实并发配额)`） | **项目建议**，非供应商上限 | 试用/低档位常见并发约 2，取 5 为通用安全档；上线前以 QuotaMonitoring 实读值为准 |
| 批量脚本 QPS | **≤ 10**（或 `min(10, 真实 QPS 配额)`） | **项目建议** | 社区/示例常见参考档；真实值以控制台/QuotaMonitoring 为准 |
| 重试退避 | 2s / 4s / 8s / 16s / 32s | 退避策略 | 指数退避，最多 5 次 |
| 单词文本长度 | 通常 < 20 字节 | 事实 | 远低于 1024 字节限制 |
| 配额校验（建议） | 启动时查一次 QuotaMonitoring | 可选 | 取真实 `limit` 覆盖保守默认值，并在 summary 日志记录 |

> **实现建议**：批量脚本用 token bucket 限流，并发上限初始化为 `min(项目建议, QuotaMonitoring 实读 limit)`；对 `3003` / `3005` / `3030` / `3031` / `3032` 等可重试错误码执行指数退避。

### 10.5 提升配额

如真实配额不足以满足 300 词批量生成的并发需求，可在控制台购买**并发/QPS 叠加包**提升账号配额。具体价格与档位以[官方计费文档](https://www.volcengine.com/docs/6561/1359370)和控制台为准。

---

## 11. 环境变量映射

本项目通过以下环境变量管理 TTS 凭据和配置：

| 环境变量 | 对应 API 参数 | 必填 | 说明 |
|---------|-------------|------|------|
| `DOUBAO_APP_ID` | `app.appid` | ✅ | 应用 ID，从控制台获取 |
| `DOUBAO_TOKEN` | `app.token` + `Authorization` Header | ✅ | Access Token，从控制台获取（同时用于请求体和 Bearer 头） |
| `DOUBAO_CLUSTER` | `app.cluster` | ✅ | 业务集群，标准音色为 `volcano_tts`，大模型音色为 `volcano_mega` |
| `DOUBAO_VOICE_TYPE` | `audio.voice_type` | ✅ | 音色 ID，如 `BV700_streaming` |
| `DOUBAO_SAMPLE_RATE` | `audio.rate` | ❌ | 采样率，默认 `24000`，可选 `8000` / `16000` / `24000` |
| `DOUBAO_AUDIO_FORMAT` | `audio.encoding` | ❌ | 音频格式，默认 `mp3`，可选 `mp3` / `wav` / `pcm` / `ogg_opus` |

> **安全规则**：这些变量只从 `.env` 文件或系统环境变量读取，**绝不出现在代码、注释、commit message、日志或 manifest 中**。

---

## 12. `.env.example` 模板建议

以下为 Sprint 2 后端骨架应使用的 `.env.example` 模板（仅占位符，不含真实值）：

```bash
# ─── 豆包 TTS 配置 ───────────────────────────────────────
# 所有值从火山引擎控制台获取：https://console.volcengine.com/speech/app
# ⚠️ 严禁在代码、日志、commit message 中出现真实凭据

# [必填] 应用 ID
DOUBAO_APP_ID=your_app_id_here

# [必填] Access Token — 同时用于 Authorization Bearer 头和请求体
DOUBAO_TOKEN=your_access_token_here

# [必填] 业务集群 — 标准音色用 volcano_tts，大模型音色用 volcano_mega
DOUBAO_CLUSTER=volcano_tts

# [必填] 音色 ID — 从音色列表文档获取
DOUBAO_VOICE_TYPE=your_voice_type_here

# [可选] 采样率，默认 24000
DOUBAO_SAMPLE_RATE=24000

# [可选] 音频格式，默认 mp3
DOUBAO_AUDIO_FORMAT=mp3
```

---

## 13. 关键注意事项

### 13.1 鉴权格式陷阱

火山引擎的 Bearer Token 格式为 `Bearer;{token}`（**分号分隔**），而非标准的 `Bearer {token}`（空格分隔）。这是最常见的接入错误。确认方式：检查 HTTP 响应是否返回 `authenticate request: load grant: requested grant not found`。

### 13.2 音色与集群匹配

- **标准音色**（如 `BV700_streaming`）→ cluster 为 `volcano_tts`
- **大模型音色**（如 `zh_female_xueayi_saturn_bigtts`）→ cluster 为 `volcano_mega`
- **复刻音色**（如 `S_xxx` 或 `ICL_xxx`）→ cluster 见控制台
- 音色与 cluster 不匹配会导致 `Fail to feed text, reason Init Engine Instance failed`

### 13.3 英文发音注意

本项目是英语启蒙教育，合成英文单词时：
- 使用英文音色或中英双语音色
- 如使用中文音色读英文，设置 `pure_english_opt: 1` 可改善数字处理

### 13.4 幂等性

- 相同输入应命中已生成的文件，不重复请求
- 幂等键：`sha256(unitIdx + word + voice + sample_rate)`
- 已存在的文件跳过，实现断点续跑

### 13.5 错误处理分类

| 错误类型 | 代表错误码 | 处理策略 |
|---------|-----------|---------|
| 参数错误 | 3001, 3006, 3010, 3011, 3050 | 不重试，记录失败原因 |
| 服务端临时错误 | 3003, 3005, 3030, 3031, 3032, 3040 | 指数退避重试（最多 5 次） |
| 鉴权错误 | HTTP 401/403 | 不重试，提示检查凭据 |
| 网络超时 | 无响应 / 连接中断 | 指数退避重试 |

---

## 14. 信息来源

| 来源 | URL |
|------|-----|
| HTTP 非流式接口文档 | https://www.volcengine.com/docs/6561/79820 |
| 参数基本说明（请求/返回字段，含 `extra_param`/`disable_emoji_filter`） | https://www.volcengine.com/docs/6561/79823 |
| **QuotaMonitoring 配额监控接口（查询真实 QPS/并发 `limit`）** | https://www.volcengine.com/docs/6561/1476626 |
| 控制台使用 FAQ | https://docs.volcengine.com/docs/6561/196768 |
| 计费说明 | https://www.volcengine.com/docs/6561/1359370 |
| WebSocket 二进制协议文档 | https://www.volcengine.com/docs/6561/79818 |
| 性能实测对比（QPS 数据） | https://developer.volcengine.com/articles/7645611373351272486 |

> 以上文档为火山引擎官方文档，可能随产品迭代更新。接入前请以控制台最新信息为准。
