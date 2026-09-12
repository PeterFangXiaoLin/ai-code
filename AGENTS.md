# AGENTS.md

本文件适用于整个仓库，供在此项目中工作的编码代理参考。

## 仓库概览

这是一个前后端分离仓库，不是 Maven 或 npm 的统一工作区：

- `ai-code-backend/`：Java 21、Spring Boot 3.5.16、Maven、Mybatis-Flex、MySQL。
- `ai-code-frontend/`：Vue 3、TypeScript、Vite、npm、Ant Design Vue。

运行命令前先进入对应模块，不要在仓库根目录执行 `mvn` 或 `npm` 命令。

## 后端约定

- Java 包根路径为 `com.example.aicode`。
- 启动类是 `com.example.aicode.AiCodeBackendApplication`。
- 服务端口为 `8123`，context path 为 `/api`。
- Controller 放在 `controller` 包中；Knife4j 当前只扫描该包。
- 接口成功响应优先使用 `ResultUtils.success(...)`，错误响应使用统一的 `ErrorCode`、`BusinessException` 和 `ThrowUtils`，不要在各 Controller 中重复定义响应格式。
- 新增全局异常时更新 `GlobalExceptionHandler`，且避免把内部异常细节直接返回给客户端。
- Lombok 版本由 Spring Boot 父 POM 管理。除非有经过验证的兼容性原因，不要在多个位置硬编码 Lombok 版本。
- 数据库驱动已存在，但数据源和数据访问层尚未配置。添加数据库功能时补充所需 starter、配置和测试，不要提交真实账号、密码或其他密钥。
- 保持现有 Java 格式：4 空格缩进、类名使用 PascalCase、方法和字段使用 camelCase。

后端验证命令：

```powershell
cd ai-code-backend
mvn clean package
```

若本机默认 JDK 不是 21，先正确设置 `JAVA_HOME`。不要提交 `target/`。

## 前端约定

- 使用 Vue 单文件组件、TypeScript 和 Composition API；新组件优先采用 `<script setup lang="ts">`。
- 构建前端界面时，优先使用 Ant Design Vue 提供的现成组件。
- 页面放在 `src/views/`，通用组件放在 `src/components/`，路由集中维护在 `src/router/`，跨页面状态使用 `src/stores/` 下的 Pinia store。
- 沿用现有路径别名和 TypeScript/Vite 配置，避免无必要地改动脚手架基础配置。
- 使用 npm，并保留、更新 `package-lock.json`；不要混用其他包管理器的锁文件。
- `oxlint` 和 `eslint-plugin-oxlint` 必须满足彼此的 peer dependency。当前二者锁定在 `1.73.x`，调整其中一个时必须检查另一个的兼容范围。
- 遇到依赖冲突时修正版本关系，不使用 `--force` 或 `--legacy-peer-deps` 作为常规解决方案。
- 不要提交 `node_modules/`、`dist/`、`.eslintcache` 或 `*.tsbuildinfo`。

前端改动至少运行与改动相关的检查；完成常规功能改动时运行完整验证：

```powershell
cd ai-code-frontend
npm run type-check
npm run lint
npm run build
```

注意：`npm run lint` 和 `npm run format` 会修改文件。检查这些命令产生的差异，只保留与当前任务相关的变更。

## 跨模块改动

- 前后端接口统一以 `/api` 为后端基础路径。
- 修改端口、context path、启动命令、核心依赖或公开接口后，同步更新根目录 `README.md`。
- API 字段或响应结构变化时，同时更新后端实现与对应的前端类型/调用代码。
- 当前没有自动化测试目录。新增业务逻辑时应补充与模块技术栈匹配的测试；不要用“现有测试不存在”代替必要验证。
- 开始工作前检查 `git status`，保留用户已有改动；不要回退或覆盖与当前任务无关的文件。
