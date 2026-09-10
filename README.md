# AI Code

一个前后端分离的 AI 编程项目。仓库由 Spring Boot 后端和 Vue 前端两个独立模块组成。

## 技术栈

### 后端

- Java 21
- Spring Boot 3.5.16
- Maven
- Spring Web、Spring AOP
- MySQL Connector/J
- Lombok
- Hutool 5.8.46
- Knife4j 4.4.0（OpenAPI 3）

后端继承 `spring-boot-starter-parent`，Lombok 版本由 Spring Boot 的依赖管理统一提供，无需在普通依赖和注解处理器配置中重复指定版本。

### 前端

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- ESLint、Oxlint、Oxfmt

前端通过 Vue 官方脚手架命令创建：

```bash
npm create vue@latest
```

脚手架及环境要求可参考 [Vue 官方快速上手文档](https://vuejs.org/guide/quick-start.html)。

## 目录结构

```text
ai-code/
├── ai-code-backend/   # Spring Boot 后端
├── ai-code-frontend/  # Vue 前端
├── AGENTS.md          # 仓库开发约定
└── README.md
```

## 环境要求

- JDK 21
- Maven 3.6.3 或更高版本
- Node.js `^22.18.0` 或 `>=24.12.0`
- npm

前端当前锁定的部分开发依赖在 Node.js 22 下可能要求至少 22.22.2。若安装时出现 `EBADENGINE` 警告，建议升级到满足提示的 Node.js 版本。

## 启动后端

进入后端目录：

```powershell
cd ai-code-backend
mvn spring-boot:run
```

如果本机默认 Java 不是 21，可在当前 PowerShell 会话中先切换 JDK（路径按实际安装位置修改）：

```powershell
$env:JAVA_HOME = 'D:\Program Files\Java\jdk-21'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
mvn spring-boot:run
```

后端默认地址为 `http://localhost:8123/api`：

- 健康检查：`GET http://localhost:8123/api/health/`
- Knife4j 文档：`http://localhost:8123/api/doc.html`

构建并运行 JAR：

```powershell
mvn clean package
java -jar target/ai-code-backend-0.0.1-SNAPSHOT.jar
```

项目已引入 MySQL 驱动，但尚未配置数据源，因此当前启动不依赖本地 MySQL 服务。接入数据库时还需增加相应的数据访问依赖并配置连接信息。

## 启动前端

进入前端目录并安装依赖：

```powershell
cd ai-code-frontend
npm install
npm run dev
```

Vite 开发服务器默认地址为 `http://localhost:5173`。常用命令：

```powershell
npm run type-check  # TypeScript 类型检查
npm run lint        # Oxlint 和 ESLint 检查并自动修复
npm run format      # 格式化 src 目录
npm run build       # 类型检查并生成生产构建
npm run preview     # 本地预览生产构建
```

`oxlint` 与 `eslint-plugin-oxlint` 当前均使用 `1.73.x`。二者存在 peer dependency 约束，升级时应同步检查兼容版本，不要使用 `--force` 或 `--legacy-peer-deps` 掩盖版本冲突。

## 当前后端基础能力

- 统一响应结构 `BaseResponse<T>`
- 响应构造工具 `ResultUtils`
- 业务异常、错误码与全局异常处理
- 全局 CORS 配置
- AOP 代理支持
- Knife4j 接口文档
- 健康检查接口

业务功能、数据库模型和前后端接口联调仍待后续实现。
