| 隐私/条款页面 | 源码含 `data-nav-route="privacy/terms/about"` |

---

## 6. API 客户端（auth/apiClient.js）

```
apiRequest(method, path, body)
    │
    ├── isFileProtocol() → sessionStorage token
    └── HTTP mode → cookie session_token

babyIslandApi（挂载在 window）：
    ├── getSession(token)         → GET /api/auth/session
    ├── upsertSession(token, data) → POST /api/learning/upsert
    └── 另有 mock-server（apps/frontend/src/mock-server/server.cjs）
```

---

## 7. 架构图（Mermaid）

```mermaid
graph TD
    subgraph "App Shell"
        HTML["index.html<br/>App Shell + bottom-tabs nav"]
        CSS["style.css<br/>CSS 变量：--cream #f8f8f0 / --mint #19c8b9 / --earth #794f27"]
        JS["script.js<br/>IIFE 模块"]
    end

    subgraph "State (闭包内)"
        STATE["state 对象<br/>progress / preferences / learningActivity / mistakeBook"]
        PURE["纯函数层<br/>normalizeProgress / applyQuizAnswer / buildLocalRankings..."]
    end

    subgraph "Rendering"
        NAV["navigate() hash路由"]
        RM["renderMap()"]
        RD["renderDetail()"]
        RR["renderRanking()"]
