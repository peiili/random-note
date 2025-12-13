# 快速启动指南

## 1. 配置数据库连接

创建 `.env` 文件（复制自 `.env.example`）：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填写数据库密码：

```env
DATABASE_URL="mysql://xek:你的密码@rm-bp1r11zh6j1nnf09l1o.mysql.rds.aliyuncs.com:3306/xek"
```

## 2. 安装依赖（如果还未完成）

```bash
npm install
```

## 3. 生成 Prisma Client

```bash
npx prisma generate
```

## 4. 验证数据库连接

```bash
npx prisma studio
```

这会打开一个可视化的数据库管理界面，确认能够连接到数据库。

## 5. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动。

## 常见问题

### 1. Prisma 连接错误

确保：
- DATABASE_URL 格式正确
- 数据库服务可访问
- 用户名密码正确
- 数据库已创建

### 2. Node 版本警告

如果看到 Node.js 版本警告，建议升级到 Node.js 20.9.0 或更高版本：

```bash
nvm install 20
nvm use 20
```

### 3. 文章不显示

确保数据库中有：
- 已创建的用户（users表）
- 状态为 'published' 的文章（articles表）
- 文章关联了作者（author_id）

可以通过 Prisma Studio 手动添加测试数据。

## 测试数据

如果需要添加测试数据，可以使用 Prisma Studio：

```bash
npx prisma studio
```

1. 创建一个用户（users表）
2. 创建分类和标签
3. 创建文章，关联用户和分类
4. 将文章状态设为 'published'

## 功能验证清单

- [ ] 首页显示文章列表
- [ ] 点击文章标题进入详情页
- [ ] 文章详情页正确显示内容
- [ ] 分类页面可访问
- [ ] 标签页面可访问
- [ ] 搜索功能正常工作
- [ ] 评论提交功能正常
- [ ] 分页功能正常

## 下一步

1. 添加用户认证系统（可选）
2. 添加文章管理后台
3. 配置图片上传
4. 优化SEO设置
5. 添加RSS订阅
6. 配置评论邮件通知
