# ai-code-backend

基于 Maven 的 Spring Boot 3.5.16 / Java 21 项目。

## 依赖

- Spring Web：`spring-boot-starter-web`
- MySQL JDBC 驱动：`mysql-connector-j`
- Lombok：已配置注解处理器

依赖版本由 Spring Boot 统一管理。

## 启动

需要 JDK 21 和 Maven 3.6.3 或更高版本。在项目根目录执行：

```powershell
$env:JAVA_HOME = 'D:\Program Files\Java\jdk-21'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
mvn spring-boot:run
```

请按实际安装位置调整 `JAVA_HOME`。以上设置仅对当前 PowerShell 会话生效。

默认端口为 `8080`，启动类为 `com.example.aicode.AiCodeBackendApplication`。
当前是基础项目，尚未添加业务接口，访问根路径会返回 404。

## 构建

```powershell
mvn clean package
java -jar target/ai-code-backend-0.0.1-SNAPSHOT.jar
```

## MySQL

已添加 MySQL 驱动，尚未配置数据库连接，因此启动不需要本地 MySQL 服务。
如需 Spring 管理数据源或使用 `JdbcTemplate`，可后续添加 `spring-boot-starter-jdbc`，
并配置数据库连接地址、用户名和密码。
