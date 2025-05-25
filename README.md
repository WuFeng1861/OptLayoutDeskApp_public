# OptLayout

OptLayout 是一个基于 Electron、Vue 3 和 TypeScript 的桌面应用程序项目。它旨在提供一个高效且可定制的用户界面，适用于需要灵活布局的应用场景。

## 项目特点

- **Electron 框架**：利用 Electron 的强大功能，将 Web 技术应用于桌面应用开发。
- **Vue 3**：采用 Vue 3 的 Composition API 和响应式特性，提升开发效率和应用性能。
- **TypeScript**：使用 TypeScript 进行类型检查和代码优化，提高代码质量和可维护性。
- **模块化设计**：采用模块化的架构设计，便于扩展和维护。
- **可定制布局**：支持灵活的布局配置，满足不同用户的需求。

## 安装与运行

### 环境要求

- Node.js (推荐版本: v20.11.0 或更高)
- npm (推荐版本: v10.2.4 或更高)

### 安装步骤

1. 克隆项目
   - 打开终端或命令提示符
   - 运行以下命令：
     ```
     git clone https://github.com/OptLayout/OptLayout-electron
     ```

2. 安装 Node.js 环境
   - 访问 [Node.js 官网](https://nodejs.org/)
   - 下载并安装适合您操作系统的最新 LTS 版本

3. 安装 JavaScript 依赖
   - 在项目根目录下运行以下命令：
     ```
     npm install
     ```

4. 开发模式
   - 运行以下命令启动开发服务器和 Electron 应用程序：
     ```
     npm run dev
     ```

5. 打包应用
   - 运行以下命令构建生产版本的应用程序：
     ```
     npm run build
     ```
   - 构建完成后，可分发的应用程序包将在 `dist` 目录下生成