# 宝宝闯关 · 后端服务

## 快速启动

```bash
# 1. 安装依赖
cd backend
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入真实凭据（app ID、token 等）

# 3. 启动服务
npm start        # 生产模式
npm run dev      # 开发模式（文件变更自动重启）
```

## 豆包 TTS 批量预录

```bash
# 1. 确保 backend/.env 已配置真实凭据
#    必需: DOUBAO_APP_ID, DOUBAO_TOKEN, DOUBAO_VOICE_TYPE
#    可选: DOUBAO_CLUSTER, DOUBAO_SAMPLE_RATE, DOUBAO_AUDIO_FORMAT

# 2. 运行生成（幂等：已存在的 MP3 自动跳过）
cd backend
npm run generate-tts

# 输出:
#   assets/audio/words/hello.mp3 ...（10 个 MP3 文件）
#   assets/audio/words/word-audio-manifest.json（状态清单）

# 3. 重新生成（失败或新增单词时）
#    直接再次运行即可 — 已成功生成的 MP3 不会重复请求
npm run generate-tts
```

### 幂等性

- 目标 MP3 已存在且 >0 bytes 且 MP3 头合法 → **跳过**
- 失败条目 → 删除 MP3 后重新运行即可重试
- 最大重试 5 次（指数退避 2s/4s/8s/16s/32s）

### 错误处理

| 错误码 | 行为 |
|--------|------|
| 3003 并发超限 | 指数退避重试 |
| 3005 服务繁忙 | 指数退避重试 |
| 3001/3011 参数错误 | 不重试，记录失败原因 |
| 网络超时 | 指数退避重试 |

## 所需环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `DOUBAO_APP_ID` | ✅ | 火山引擎应用 ID |
| `DOUBAO_TOKEN` | ✅ | Access Token（仅用于 Authorization: Bearer Header，body app.token 可为任意非空字符串） |
| `DOUBAO_CLUSTER` | ✅ | 业务集群（`volcano_tts` / `volcano_mega`） |
| `DOUBAO_VOICE_TYPE` | ✅ | 音色 ID（如 `BV700_streaming`） |
| `DOUBAO_SAMPLE_RATE` | ❌ | 采样率，默认 `24000` |
| `DOUBAO_AUDIO_FORMAT` | ❌ | 音频格式，默认 `mp3` |
| `PORT` | ❌ | 服务端口，默认 `3000` |
| `NODE_ENV` | ❌ | 运行模式（`development` / `production`） |
| `SMS_PROVIDER` | ❌ | 短信供应商：`development`（默认）/ `aliyun`（已接入） |
| `SMS_ALIYUN_ACCESS_KEY_ID` | aliyun 时必填 | 阿里云 RAM AccessKey ID |
| `SMS_ALIYUN_ACCESS_KEY_SECRET` | aliyun 时必填 | 阿里云 RAM AccessKey Secret |
| `SMS_ALIYUN_SIGN_NAME` | aliyun 时必填 | 短信签名（控制台已审核通过） |
| `SMS_ALIYUN_TEMPLATE_CODE` | aliyun 时必填 | 短信模板 CODE（变量默认 `${code}`） |
| `SMS_ALIYUN_TEMPLATE_PARAM_KEY` | ❌ | 模板变量名，默认 `code` |
| `INSFORGE_URL` | 学习同步必填 | InsForge 项目 URL，只在服务端使用 |
| `INSFORGE_API_KEY` | 学习同步必填 | InsForge 项目 admin API key，只在服务端使用，禁止暴露给前端 |

---

## 认证 / 短信登录（Sprint 2–5）

### 功能概述

手机号 + 验证码登录系统，包含：

- **发送验证码**：`POST /api/auth/send-code` — 校验手机号格式，限流（60s 冷却 + 5次/15min），发送验证码
- **校验登录**：`POST /api/auth/verify-code` — 校验验证码，限流（3次错误失效），一次性消费，创建 session
- **会话恢复**：`GET /api/auth/session` — 通过 cookie 或 Authorization header 恢复登录态
- **退出登录**：`POST /api/auth/logout` — 撤销 session，清除 cookie

## 学习数据同步（InsForge）

当前后端已接入 InsForge，用现有手机号 session 保护学习数据接口：

- `GET /api/learning/state`：读取孩子资料、偏好、各地图进度、学习日期、错题本
- `PUT /api/learning/state`：保存完整学习快照
- `PATCH /api/learning/preferences`：保存宝宝资料和偏好
- `POST /api/learning/quiz-attempts`：追加答题事件
- `POST /api/learning/support-feedback`：提交反馈

数据库表包括 `baby_profiles`、`baby_world_progress`、`baby_learning_activity`、`baby_mistakes`、`baby_quiz_attempts`、`baby_support_feedback`。所有表启用 RLS；当前 Express 服务端使用 server-only `INSFORGE_API_KEY` 写入，未来如果改成前端直连 InsForge Auth，也已有 owner-only policy 基础。

> `INSFORGE_API_KEY` 是 admin key，不能写入前端、公开环境变量、日志或 commit message。

### 安全策略

| 策略 | 说明 |
|------|------|
| 验证码哈希存储 | SHA-256 哈希，明文不在磁盘/日志 |
| 一次性消费 | 验证成功后立即从数据库删除 |
| 手机号脱敏 | 日志只显示 86****8000 格式 |
| 限流 | 60s 冷却 + 5次/15min/手机号 + 20次/15min/IP |
| 错误枚举防御 | 统一错误信息「验证码错误或已过期」 |
| Session | 随机 64 位 hex token，HttpOnly/SameSite=Lax cookie |

### 开发验证码模式（推荐）

```bash
# 1. 确保 SMS_PROVIDER 为 development（默认值）
cp .env.example .env
# .env 中：SMS_PROVIDER=development

# 2. 启动服务
npm start

# 3. 前端操作
# 访问 http://localhost:3000
# 点击受限关卡 → 弹出手机验证码登录
# 输入手机号 → 点击「发送验证码」
# 验证码会在后端终端输出：
#
#   ╔═════════════════════════════════════════════╗
#   ║           [DEV SMS] 验证码                   ║
#   ║  手机号: 86****8000                ║
#   ║  验证码: 854786                    ║
#   ║  有效期: 5 分钟                               ║
#   ╚═════════════════════════════════════════════╝
#
# 4. 在前端弹窗中输入终端显示的验证码即可登录
# 注意：前端弹窗底部「开发模式」区域也会显示验证码
```

**开发模式特点：**
- 不产生真实短信费用
- 验证码同时显示在**后端终端**和**前端弹窗底部**
- 前端弹窗底部标注 🔧 开发模式
- 适合本地开发、UI 验收、集成测试

### 真实短信接入清单

当需要上线使用真实短信服务时，按以下步骤配置：

#### 1. 选择供应商

- **阿里云**：代码已接入（`SMS_PROVIDER=aliyun`）
- **复用影关**：签名/模板/AK 与 movie-game（影关）同一阿里云 Dysms 账号（签名「墨斗曲线」、模板 `SMS_325310062`）；本地填 `backend/.env`，`apps/backend` 自动读同一文件

#### 2. 配置阿里云短信（你需要在控制台完成的部分）

```bash
# 在 backend/.env 或项目根 .env 中配置：
SMS_PROVIDER=aliyun
SMS_ALIYUN_ACCESS_KEY_ID=your_access_key_id
SMS_ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
SMS_ALIYUN_SIGN_NAME=宝宝闯关
SMS_ALIYUN_TEMPLATE_CODE=SMS_123456789
# 若模板变量名不是 code，再设：
# SMS_ALIYUN_TEMPLATE_PARAM_KEY=code
```

**你在阿里云控制台需要完成：**
1. 登录 [阿里云 RAM](https://ram.console.aliyun.com/) → 创建 AccessKey（建议最小权限：`AliyunDysmsFullAccess` 或自定义 SendSms）
2. 开通 [短信服务](https://dysms.console.aliyun.com/)
3. 申请短信签名（如「宝宝闯关」）并等待审核通过
4. 申请短信模板，变量与 `SMS_ALIYUN_TEMPLATE_PARAM_KEY` 一致（默认 `code`），例如：`您的验证码为：${code}，5分钟内有效。`
5. 将签名名称与模板 CODE 填入 `.env`，重启 `npm start`

**代码侧已实现：**
- RPC 签名调用 `dysmsapi.aliyuncs.com` SendSms（无 SDK 依赖）
- 国内号自动去掉 `+86` 前缀
- 失败映射：`SMS_UNAVAILABLE`（503）/ `SEND_FAILED`（500）
- 发送失败回滚验证码记录，不占用冷却
- 日志手机号脱敏，密钥不入日志

本地仍可用 `SMS_PROVIDER=development` 免费用终端验证码联调。

#### 3. 生产环境检查清单

- [ ] `SMS_PROVIDER=aliyun`（非 development）
- [ ] 四项阿里云凭据已配置且签名/模板已审核通过
- [ ] `NODE_ENV=production`（启用 Secure cookie）
- [ ] Session 有效期配置合理（默认 30 天）
- [ ] CORS 白名单已配置，不包含 `'null'`
- [ ] 确认验证码/完整手机号不写入日志
- [ ] 压力测试：限流策略在生产流量下正常
- [ ] HTTPS 就绪，cookie 正常工作

> ⚠️ **安全警告**：生产环境绝不可使用 `SMS_PROVIDER=development`。  
> ⚠️ 供应商凭据绝不可提交到代码仓库。  
> ⚠️ 生产缺供应商配置 → 服务启动时显式拒绝。

---

## 测试

```bash
# 运行全部后端测试（4 个测试文件）
cd backend
npm test

# 运行全部前端+后端+集成测试
cd ..
node --test quiz.test.js voice-samples-v2.test.js generate-word-audio-v2.test.js backend/src/auth.test.js
```

### 测试覆盖

| 测试文件 | 测试内容 | 数量 |
|----------|----------|------|
| `backend/src/auth.test.js` | 验证码 TTL、冷却、限流、尝试次数、一次性消费、脱敏、session、logout、HTTP 集成 | 50 |
| `quiz.test.js` | 考核逻辑、关卡解锁、岛屿渲染、航线、词单 manifest、SMS 弹窗 UI 行为 | 45 |
| `voice-samples-v2.test.js` | V2 68 音色清单、JSON 流解析、manifest、试听页 | 35 |
| `generate-word-audio-v2.test.js` | 单词音频生成器、幂等性、manifest 结构、JS manifest | 34 |

## 豆包美式英语音色试听库

```bash
# 1. 确保 backend/.env 已配置真实凭据
#    必需: DOUBAO_APP_ID, DOUBAO_TOKEN
#    （VOICE_TYPE 不需要 — 脚本内置 23 个音色，逐个调用）

# 2. 生成全部音色试听 MP3（幂等：已存在的自动跳过）
cd backend
npm run generate-voice-samples

# 输出:
#   assets/audio/voice-samples/{voice_type}.mp3（23 个 MP3 文件）
#   assets/audio/voice-samples/voice-samples-manifest.json（状态清单）

# 3. 本地试听
#   用浏览器打开项目根目录 voice-samples.html
open voice-samples.html

# 4. 重新生成（失败时重跑）
#   再次运行即可 — 已成功生成的不会重复请求
npm run generate-voice-samples
```

### 音色分类

| 分类 | 数量 | 集群 | 说明 |
|------|------|------|------|
| 小模型 V1 | 10 | `volcano_tts` | 官方主表，支持 pitch_ratio |
| 大模型 1.0 | 10 | `volcano_mega` | 官方主表，不支持 pitch_ratio |
| 候选 | 3 | `volcano_mega` | 主表未确认，标注 candidate |

### 试听文本

```
Hello friends! Welcome to our English class. Look at the red apple and the
blue sky. Can you count with me? One, two, three! What's your favorite animal?
```

> ⚠️ **安全警告**：真实凭据**绝不**写入 `.env.example`、代码、注释、commit message 或日志。

---

## 豆包语音合成模型 2.0 · 美式英语声线试听库（V3 API）

> 新增于 Sprint 2.5，独立于上述 V1 试听库。使用 V3 HTTP Chunked Unidirectional 接口。

```bash
# 1. 确保 backend/.env 已配置真实凭据
#    必需: DOUBAO_APP_ID, DOUBAO_TOKEN
#    （使用旧版控制台鉴权：X-Api-App-Id + X-Api-Access-Key）

# 2. 生成全部 68 个 2.0 音色试听 MP3（幂等：已存在的自动跳过）
cd backend
npm run generate-voice-samples-v2

# 输出:
#   assets/audio/voice-samples-v2/{speaker}.mp3（68 个 MP3 文件）
#   assets/audio/voice-samples-v2/voice-samples-manifest.json（状态清单）

# 3. 本地试听
#   用浏览器打开项目根目录 voice-samples-v2.html
open voice-samples-v2.html

# 4. 重新生成（失败时重跑）
#   再次运行即可 — 已成功生成的不会重复请求
npm run generate-voice-samples-v2
```

### API 说明

| 项 | 值 |
|------|------|
| 接口 | `POST https://openspeech.bytedance.com/api/v3/tts/unidirectional` |
| 鉴权 | `X-Api-App-Id` + `X-Api-Access-Key`（旧版控制台） |
| 资源 ID | `seed-tts-2.0` |
| 传输协议 | HTTP Chunked（流式 JSON） |
| 音频格式 | MP3, 24000 Hz, speech_rate=0, loudness_rate=0 |

### 音色分类

| 分类 | 数量 |
|------|------|
| 女声 | 27 |
| 男声 | 41 |
| **总计** | **68** |

### 生成策略

1. **探针**：先请求 `en_male_tim_uranus_bigtts`；若全局鉴权/resource_id 错误则停止批量
2. **幂等**：已有有效 MP3 直接跳过
3. **重试**：并发/服务忙错误指数退避（5 次），其余不重复请求
4. **原子写入**：manifest 写入失败不破坏已有数据

### 试听文本

```
Hello friends! Welcome to our English class. Look at the red apple and the
blue sky. Can you count with me? One, two, three! What's your favorite animal?
```

### 测试

```bash
# 运行 V2 专用测试
node --test voice-samples-v2.test.js
```

---

## 关卡单词音频生成器（模型 2.0 + 地图声线）

> 本项目正式声线：海岛 **Natasha**（`en_female_natasha_uranus_bigtts`），沙漠 **Hayley**（`en_female_hayley_uranus_bigtts`）。
> 所有关卡单词发音统一使用豆包语音合成模型 2.0，不再使用 V1 Bearer/BV 音色。

```bash
# 1. 确保 backend/.env 已配置真实凭据
#    必需: DOUBAO_APP_ID, DOUBAO_TOKEN
#    （声线已在生成器中固定；DOUBAO_VOICE_TYPE 仅兼容旧脚本）

# 2. 生成全部关卡单词音频（幂等：已存在的有效 MP3 自动跳过）
cd backend
npm run generate-word-audio

# 3. 增量生成（新增课程单元后）
#    直接再次运行即可 — 已生成的不会重复请求
npm run generate-word-audio
```

### 技术规格

| 项 | 值 |
|------|------|
| 接口 | `POST https://openspeech.bytedance.com/api/v3/tts/unidirectional` |
| 鉴权 | `X-Api-App-Id` + `X-Api-Access-Key`（旧版控制台） |
| 资源 ID | `seed-tts-2.0` |
| 声线 | 海岛 `en_female_natasha_uranus_bigtts`；沙漠 `en_female_hayley_uranus_bigtts` |
| 输出格式 | MP3, 24000 Hz, 正常语速/音量 |
| 合成内容 | `word` 保持展示/查找文本；`tts_text` 仅用于补问号、感叹号等合成提示 |
| 输出目录 | `assets/audio/words/` |
| 输出文件 | `{word}.mp3`（小写，特殊字符转为下划线） |

### 缓存/幂等策略

- **缓存键**：`word|tts_text|speaker|resource|format|sample_rate|rate|emotion` — 换声线、标点、情绪或语速会重新生成
- **跳过条件**：文件存在 + MP3 头有效 + manifest hash 一致 + cache_key 一致
- **重试**：可重试错误（并发/服务忙）最多 3 次指数退避
- **原子写入**：manifest 先写临时文件再 rename，中断不破坏已有数据

### 输出结构（manifest V2）

```json
{
  "version": "2.0",
  "model": "豆包语音合成模型2.0",
  "speaker": "mixed",
  "speakers": {
    "ocean": "en_female_natasha_uranus_bigtts",
    "desert": "en_female_hayley_uranus_bigtts"
  },
  "audio_format": "mp3",
  "sample_rate": 24000,
  "entries": [
    {
      "word": "hello",
      "tts_text": "Hello!",
      "speaker": "en_female_hayley_uranus_bigtts",
      "emotion": "happy",
      "speech_rate": 0,
      "level_ids": [1],
      "level_count": 1,
      "zh": "你好",
      "unit": "First Words · 初见英语",
      "url": "assets/audio/words/hello.mp3",
      "status": "generated",
      "size_bytes": 12345,
      "sha256": "abc...",
      "cache_key": "hello|tts=Hello!|en_female_hayley_uranus_bigtts|seed-tts-2.0|mp3|24000|rate=0|emotion=happy"
    }
  ],
  "summary": {
    "total": 200,
    "generated": 0,
    "skipped": 101,
    "available": 101,
    "failed": 0,
    "not_attempted": 99,
    "levels": 400,
    "speaker": "mixed"
  }
}
```

### 测试

```bash
# 运行全部测试
node --test quiz.test.js voice-samples-v2.test.js generate-word-audio-v2.test.js

# 仅单词音频测试
node --test generate-word-audio-v2.test.js
```

## 健康检查

```bash
# 启动服务后
curl http://localhost:3000/healthz

# 期望输出
# {"status":"ok"}
```

## 端口配置

默认监听 `3000` 端口。可通过 `PORT` 环境变量覆盖：

```bash
PORT=8080 npm start
```
