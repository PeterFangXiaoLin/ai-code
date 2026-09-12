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
- Mybatis Flex

后端继承 `spring-boot-starter-parent`，Lombok 版本由 Spring Boot 的依赖管理统一提供，无需在普通依赖和注解处理器配置中重复指定版本。

### 前端

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- ESLint、Oxlint、Oxfmt
- Ant Design Vue

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



### 前端初始化修改

引入 Ant Design Vue https://antdv.com/docs/vue/getting-started

使用 AI 生成logo 和网站图标

使用 AI 生成布局

普通页面布局位于 `ai-code-frontend/src/layouts/BasicLayout.vue`，管理布局位于 `src/layouts/AdminLayout.vue`，由路由选择布局，`App.vue` 负责全局配置和登录状态初始化。普通页面内容区独立滚动，底栏始终位于视口底部；管理端使用独立左侧菜单。

导航菜单在 `ai-code-frontend/src/config/menu.ts` 中配置，使用 `audience` 区分普通页面和管理页面；新增菜单时需同步在 `src/router/routes.ts` 注册对应路由。`GlobalHeader.vue` 和 `GlobalFooter.vue` 分别负责导航与版权信息，`UserAccountMenu.vue` 复用登录状态展示和退出登录功能。

### 管理端与权限

- 管理员角色值为 `admin`。管理员登录后默认进入 `/admin/userManage`，仅展示管理菜单；访问首页、登录页或其他普通页面时自动返回管理端。
- 游客直接访问 `/admin` 下的地址会跳到登录页并保留来源；普通用户访问时显示 403 页面。路由守卫先等待登录状态初始化，刷新管理页不会提前判定为无权限。
- `src/router/accessGuard.ts` 负责访问权限；`authRedirect.ts` 仅负责安全的登录返回地址。新增管理页面应放在 `/admin` 布局的子路由中，继承 `requiresAdmin`。
- 用户管理支持账号、昵称、角色筛选、服务端分页及创建时间排序，以及新增、编辑和删除。账号创建后不可编辑；新增账号初始密码沿用后端的 `12345678`。当前账号不可在页面中删除或降级。
- 前端菜单和路由控制用于界面隔离；实际接口权限由后端 `@AuthCheck` 校验。

在前端模块运行 `node --test tests/*.test.mjs` 可验证认证、路由权限及用户管理数据处理。`node tests/admin-preview.mjs` 可启动端口 5176 的独立界面测试环境，使用内存示例数据，不连接真实后端。该脚本不参与正常开发启动和生产构建。



引入 axios，并自定义全局请求

引入 OpenApi 工具 生成前端调用后端接口的代码

删除无用文件，组件国际化



### 用户模块开发

引入 mybatis flex

编写代码生成器

生成 user 表相关代码

移动代码，修改主键生成策略

增加 MapperScan

增加 用户角色枚举

#### 用户注册

定义dto

#### 用户登录

#### 获取当前登录的用户信息

#### 用户注销（退出登录）

#### 用户权限控制

自定义注解  + AOP 切面实现

#### 用户管理

管理员对用户进行增删改查



#### 用户模块前端开发

先定义出需要使用的文件，并配置到 route.ts 中

定义 全局变量或者叫全局状态管理，保存当前登录的用户信息

修改顶部导航条，增加获取当前登录的用户信息
