# 简约博客

一个基于 Next.js 14+ 构建的现代化博客系统，采用简约设计风格，连接MySQL数据库。

## 功能特性

- ✅ 文章列表和详情展示
- ✅ 分类和标签管理
- ✅ 评论系统（支持层级回复）
- ✅ 全文搜索功能
- ✅ 响应式设计
- ✅ SEO优化
- ✅ Markdown渲染
- ✅ 现代简约UI

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + @tailwindcss/typography
- **数据库**: MySQL (通过 Prisma ORM)
- **Markdown**: marked
- **部署**: 支持 Vercel、Docker 等

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

复制 `.env.example` 为 `.env` 并填写数据库连接信息：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```env
DATABASE_URL="mysql://用户名:密码@主机:端口/数据库名"
```

### 3. 应用数据库Schema

确保已在原blog目录执行过数据库迁移脚本：

```bash
mysql -h [host] -u [username] -p [database] < ../blog/blog_database_schema.sql
```

### 4. 生成 Prisma Client

```bash
npx prisma generate
```

### 5. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

## 项目结构

```
nextjs-blog/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   │   ├── comments/      # 评论API
│   │   └── search/        # 搜索API
│   ├── article/[slug]/    # 文章详情页
│   ├── category/[slug]/   # 分类页
│   ├── tag/[slug]/        # 标签页
│   ├── categories/        # 分类列表
│   ├── tags/              # 标签列表
│   ├── search/            # 搜索页
│   ├── layout.tsx         # 全局布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── Header.tsx         # 头部导航
│   ├── Footer.tsx         # 页脚
│   ├── ArticleCard.tsx    # 文章卡片
│   ├── CommentList.tsx    # 评论列表
│   └── Pagination.tsx     # 分页组件
├── lib/                   # 工具函数和类型
│   ├── prisma.ts          # Prisma客户端
│   ├── types.ts           # TypeScript类型定义
│   └── utils.ts           # 工具函数
├── prisma/
│   └── schema.prisma      # Prisma数据库Schema
└── public/                # 静态资源
```

## 数据库Schema

项目使用11张表的完整博客系统数据库设计：

- **users** - 用户表
- **roles** - 角色表
- **user_roles** - 用户角色关联
- **categories** - 分类表（支持层级）
- **articles** - 文章表
- **tags** - 标签表
- **article_tags** - 文章标签关联
- **comments** - 评论表（支持层级）
- **article_likes** - 文章点赞
- **comment_likes** - 评论点赞
- **media** - 媒体文件

详细的数据库设计请参考 `../blog/DATABASE_README.md`

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start

# 代码检查
npm run lint

# Prisma 相关
npx prisma generate    # 生成Prisma Client
npx prisma studio      # 打开Prisma Studio数据库管理界面
```

## 核心功能说明

### 文章管理

- 支持草稿、已发布、已归档三种状态
- 支持分类和标签分类
- 支持封面图、摘要、SEO关键词
- Markdown格式内容
- 浏览数、点赞数、评论数统计

### 评论系统

- 支持匿名评论和注册用户评论
- 支持层级回复
- 评论审核机制（pending/approved/spam/trash）
- 评论点赞功能

### 搜索功能

- 全文搜索文章标题、内容、摘要
- 实时搜索结果展示
- 支持关键词高亮（可扩展）

## 环境变量

```env
# 数据库连接
DATABASE_URL="mysql://user:password@host:port/database"

# Node环境
NODE_ENV="development"
```

## 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量 `DATABASE_URL`
4. 部署

### Docker 部署

```bash
# 构建镜像
docker build -t nextjs-blog .

# 运行容器
docker run -p 3000:3000 -e DATABASE_URL="..." nextjs-blog
```

## 注意事项

1. 评论功能默认需要审核，新评论状态为 `pending`
2. 确保数据库字符集为 `utf8mb4` 以支持 Emoji
3. 生产环境建议配置图片CDN加速
4. 建议配置数据库连接池以优化性能

## License

MIT

## 作者

Created with ❤️ using Next.js and Prisma
