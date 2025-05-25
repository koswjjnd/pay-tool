[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/L1CTotQ-)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=19449155)


## Proposal Link: https://docs.google.com/document/d/14phZYPUm03hRg1Ig7o2XtB0V4cIX-uFeu4-iDN9K6io/edit?usp=sharing

## Figma Link: https://www.figma.com/proto/dV3Pb7LVvBbcEYOkZgXBub/303-Final-Project?node-id=24-8463&p=f&t=TXmc8SJZMbr3QYA6-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=47%3A218

# PayTool - 群组支付管理工具

PayTool 是一个现代化的群组支付管理工具，帮助用户轻松管理群组账单和支付。

## 技术栈

### 前端
- Next.js 14
- TypeScript
- Tailwind CSS
- GraphQL Client
- UI 组件库：
  - shadcn/ui（基于 Radix UI）
  - Lucide Icons（图标库）
  - Tailwind CSS（样式框架）

### 后端
- Spring Boot
- GraphQL
- MySQL
- Maven

## 环境要求

- Node.js 18.0.0 或更高版本
- Java 17 或更高版本
- MySQL 8.0 或更高版本
- Maven 3.6 或更高版本

## 配置步骤

### 1. 克隆项目
```bash
git clone [项目地址]
cd final-project-paytool
```

### 2. 后端配置

1. 配置数据库
   - 创建 MySQL 数据库
   - 修改 `backend/src/main/resources/application.properties` 中的数据库配置：
     ```properties
     spring.datasource.url=jdbc:mysql://localhost:3306/paytool
     spring.datasource.username=你的用户名
     spring.datasource.password=你的密码
     ```

2. 启动后端服务
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   后端服务将在 http://localhost:8080 运行

### 3. 前端配置

1. 安装依赖
   ```bash
   cd frontend
   npm install
   ```

2. 启动开发服务器
   ```bash
   npm run dev
   ```
   前端服务将在 http://localhost:3000 运行

## 使用说明

1. 访问 http://localhost:3000 打开应用
2. 首次使用需要注册账号
3. 登录后可以：
   - 创建新的支付群组
   - 通过二维码加入群组
   - 管理群组账单
   - 查看支付状态

## 开发说明

- 前端代码位于 `frontend/src` 目录
- 后端代码位于 `backend/src/main/java` 目录
- GraphQL schema 位于 `backend/src/main/resources/schema.graphqls`

## 常见问题

1. 如果遇到数据库连接问题，请检查：
   - MySQL 服务是否运行
   - 数据库配置是否正确
   - 数据库用户权限是否足够

2. 如果前端无法连接后端，请检查：
   - 后端服务是否正常运行
   - 前端环境变量配置是否正确
   - 跨域配置是否正确

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
