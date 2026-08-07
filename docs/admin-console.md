# 嗨洛塔运维台（Admin Console）

范围：

- **A** 用户运维（封禁 / 踢下线 / VIP）
- **B** 经营概览（用户 / 会话 / 短信 / 星榜）
- **C** 关卡 + 视频目录（关卡 ↔ OSS key ↔ 下载 URL），可发布回 `asset-packs.json`

## 打开

1. 后端启动后访问：`http://localhost:3000/admin/`（末尾斜杠别丢）
2. 在 `backend/.env` 配置：

```bash
ADMIN_TOKEN=至少16位随机串
# 可选：视频 CDN / OSS 公网前缀（目录里也可改）
OSS_PUBLIC_BASE_URL=https://your-cdn.example.com
# 或
COURSE_VIDEO_BASE=https://your-cdn.example.com
```

3. 页面输入同一 Token 进入。若「进入」无反应：硬刷新 `Cmd+Shift+R`（`[hidden]` 样式曾被覆盖，已修）。

## 关卡 / 视频怎么用

对应关系落在：

| 文件 | 作用 |
|------|------|
| `data/content-catalog.json` | 运维真相源：地图、关卡、视频、ossKey、状态 |
| `asset-packs.json` | App 读取的远程清单；点「发布到 asset-packs」写入 |
| 本地 `assets/video/**` | 扫描入库的来源；包内 free-levels 仍可走本地路径 |

推荐流程：

1. **关卡** Tab → 填 OSS 公网前缀 → 保存  
2. **扫描本地视频**（`free-levels` / `paid-levels` / `math-story`）  
3. 改关卡状态（`published` / `draft` / `offline`）、改 slug / ossKey  
4. **视频** Tab 可补登记未在本地的 OSS 对象（只登记 key，不上传文件）  
5. **发布到 asset-packs** → App 下次拉 `asset-packs.json` 拿到 `levels[].downloadUrl`

OSS key 约定（默认）：

```text
assets/video/free-levels/level-{NN}-{slug}.mp4   # 1–10 包内
assets/video/paid-levels/level-{NN}-{slug}.mp4   # 11+
```

下载 URL = `{OSS_PUBLIC_BASE_URL}/{ossKey}`（关卡可单独覆盖 `publicUrl`）。

> 当前后台**不负责**把文件推上 OSS；只维护 key / URL 关系。上传仍用你现有 OSS 工具；登记后发布即可。

## API

均需：

```http
Authorization: Bearer <ADMIN_TOKEN>
# 或
X-Admin-Token: <ADMIN_TOKEN>
```

### 用户 / 看板

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/health` | 健康 / 短信就绪 / 计数 |
| GET | `/api/admin/stats` | 用户/会话/VIP/短信看板 |
| GET | `/api/admin/users?q=&page=&limit=` | 用户列表（默认掩码手机号） |
| GET | `/api/admin/users/:id` | 用户详情 + 会话 + VIP |
| POST | `/api/admin/users/:id/ban` | 封禁并吊销会话 |
| POST | `/api/admin/users/:id/unban` | 解封 |
| POST | `/api/admin/users/:id/revoke-sessions` | 踢下线 |
| POST | `/api/admin/users/:id/vip` | 开通 VIP |
| POST | `/api/admin/users/:id/vip/revoke` | 撤销 VIP |
| GET | `/api/admin/sms-events` | 短信发送记录（无验证码明文） |
| GET | `/api/admin/vips` | VIP 列表 |
| GET | `/api/admin/rankings` | 近 7 日星榜 |

### 内容（关卡 / 视频 / OSS）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/content/overview` | 地图 + OSS + 计数摘要 |
| GET / PATCH / PUT | `/api/admin/content/oss` | 读/写 publicBaseUrl、bucket 备注等 |
| GET | `/api/admin/content/maps` | 地图列表 |
| PATCH | `/api/admin/content/maps/:mapId` | 改地图状态 / 打包字段 |
| GET | `/api/admin/content/levels?mapId=&status=&q=` | 关卡列表（含 localExists / downloadUrl） |
| GET | `/api/admin/content/levels/:mapId/:levelId` | 单关 |
| PUT | `/api/admin/content/levels/:mapId/:levelId` | 更新标题/slug/ossKey/状态/publicUrl |
| POST | `/api/admin/content/levels/:mapId/:levelId/bind-video` | body: `{ videoId }` 或 `{ ossKey }` |
| POST | `/api/admin/content/levels/:mapId/:levelId/unbind-video` | 解绑 |
| GET | `/api/admin/content/videos?mapId=&q=` | 视频目录 |
| POST | `/api/admin/content/videos` | 登记视频（ossKey 必填） |
| PATCH | `/api/admin/content/videos/:id` | 改状态/标题/绑定关卡 |
| POST | `/api/admin/content/scan-local` | 扫本地 mp4 入库并回写关卡 |
| POST | `/api/admin/content/publish-asset-packs` | 把 **published** 关卡写回 `asset-packs.json`（`maps` 保持**数组**） |

## 数据

- 用户/会话：`data/users.json` / `data/sessions.json`
- VIP/排行：`data/entitlements.json` / `data/ranking.json`
- 短信事件：`data/sms-events.json`（最近 500 条，环缓冲）
- 内容目录：`data/content-catalog.json`
- App 清单：`asset-packs.json`（发布生成；`maps` 必须是数组）

## 安全

- 未配置 `ADMIN_TOKEN` → 管理接口 503
- Token 错误 → 401
- 生产务必用长随机 Token，且仅内网 / 反向代理鉴权后暴露
- 短信事件**不存验证码明文**

## 测试

```bash
node --test backend/src/admin.test.js
```
