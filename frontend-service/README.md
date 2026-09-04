# Enterprise Console (Frontend Service)

数字员工企业中台前端服务，提供数字员工管理、团队编排、SOP 流程沉淀、知识库挂载、渠道集成与智能对话交互控制台。

---

## 🚀 快速启动

前端已内置完整的 **高保真 Mock API 服务**（支持 RESTful API 与 SSE 流式打字机响应），**无需启动繁重的 Python/LLM 后端服务即可一键体验完整功能**。

### 1. 安装依赖

```bash
cd frontend-service
npm install
```

### 2. 启动开发环境（内置 Mock 模式，推荐）

```bash
npm run dev
```

- 本地服务将启动在 `http://localhost:5173`。
- Vite 开发服务器已内置 Mock 中间件插件（`mockApiPlugin`），所有 `/api/*` 请求（含登录认证、数字员工、模型配置、知识库、SOP、团队协同与 `/api/chat/stream` SSE 流式输出）直接在当前端口被拦截并响应。
- 浏览器打开 `http://localhost:5173` 即可进入系统（默认已预设管理员身份与预置数字员工数据：Sarah 财务核算员、Alex 风控专员、David 运维助手、Eva 调度组长）。

---

## 🛠️ 运行模式说明

### 模式 A：一体化内置 Mock（默认）
直接执行：
```bash
npm run dev
```
无需启动任何额外进程，Vite 中间件接管所有 API。

### 模式 B：独立 Mock 服务器（端口 8000）
如果你希望模拟真实的独立前后端分离架构（前端 5173 -> 后端 8000）：
```bash
# 窗口 1：启动 Mock API 独立服务器（运行在 8000 端口）
npm run mock

# 窗口 2：启动前端开发服务（关闭内部拦截，走 8000 代理）
VITE_MOCK=false npm run dev
```

### 模式 C：连接真实 Python/FastAPI 后端
当你启动了本地完整的核心后端服务（8000 端口）：
```bash
VITE_MOCK=false npm run dev
```
此时 Vite 会自动将所有 `/api` 请求代理转发至本地 `http://127.0.0.1:8000`。

---

## 📁 Mock 服务核心文件结构

```
frontend-service/
├── mock/
│   ├── mock-data.cjs       # 完整企业数据集（用户、数字员工、模型、SOP、知识库、渠道、会话等）
│   ├── mock-handler.cjs    # 业务路由与 SSE 流式生成器（模拟 Agent 决策、打字机输出、引用标记）
│   ├── server.cjs          # 独立 Node.js HTTP Mock 服务器（端口 8000）
│   └── vite-plugin-mock.ts # Vite 开发环境内嵌中间件插件
└── vite.config.ts          # 已集成 Mock 插件配置
```

---

## 🧪 生产构建

```bash
npm run build
```
执行 TypeScript 类型校验并输出打包产物到 `dist/`。
