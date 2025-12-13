# 博客后台管理系统

## 功能概览

✅ **已完成的功能：**
- 用户认证（NextAuth.js + JWT）
- 登录/登出功能
- 后台仪表盘（数据统计、最近文章、待审核评论）
- 文章列表管理
- 侧边栏导航
- 响应式设计

📝 **待扩展的功能：**
- 文章创建/编辑器（Markdown编辑器）
- 分类/标签CRUD
- 评论审核管理
- 用户权限管理
- 媒体文件上传
- 批量操作

## 快速开始

### 1. 访问后台登录页面

```
http://localhost:3000/admin/login
```

### 2. 使用测试账号登录

**默认管理员账号：**
- 邮箱: `admin@example.com`
- 密码: `admin123`

> ⚠️ **安全提示**: 在生产环境中请立即修改此密码！

### 3. 创建新的管理员账号

如果需要创建额外的管理员账号，运行：

```bash
node scripts/create-admin.js
```

或者手动在数据库中创建用户并分配角色。

## 页面导航

### 仪表盘 (`/admin`)
- 显示博客统计数据
- 最近发布的文章
- 待审核的评论
- 快速操作入口

### 文章管理 (`/admin/articles`)
- 查看所有文章列表
- 按状态筛选（已发布、草稿、已归档）
- 查看文章数据（浏览量、评论数、点赞数）
- 编辑/删除文章

### 分类管理 (`/admin/categories`)
- *待实现*

### 标签管理 (`/admin/tags`)
- *待实现*

### 评论管理 (`/admin/comments`)
- *待实现*

### 用户管理 (`/admin/users`)
- *待实现*

## 角色权限系统

系统支持以下角色（在 `roles` 表中定义）：

- **admin**: 管理员，拥有所有权限
- **editor**: 编辑，可以发布和管理文章
- **author**: 作者，可以发布自己的文章
- **subscriber**: 订阅者，可以评论和点赞

目前只有 `admin` 和 `editor` 角色可以访问后台管理系统。

## 技术栈

- **认证**: NextAuth.js v5
- **密码加密**: bcryptjs
- **UI**: Tailwind CSS（简约现代风格）
- **数据库**: MySQL + Prisma ORM
- **框架**: Next.js 15 (App Router)

## 配置说明

### 环境变量

确保在 `.env` 文件中配置了以下变量：

```env
# 数据库连接
DATABASE_URL="mysql://user:password@host:port/database"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

生成 NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## 开发计划

### 阶段 1: 基础功能（已完成）
- [x] 登录系统
- [x] 后台布局
- [x] 仪表盘
- [x] 文章列表

### 阶段 2: 内容管理
- [ ] Markdown 文章编辑器
- [ ] 文章创建/编辑/删除
- [ ] 分类和标签 CRUD
- [ ] 图片上传
- [ ] 文章预览

### 阶段 3: 互动功能
- [ ] 评论审核系统
- [ ] 垃圾评论过滤
- [ ] 批量操作评论

### 阶段 4: 用户管理
- [ ] 用户列表
- [ ] 角色分配
- [ ] 用户状态管理
- [ ] 权限控制

### 阶段 5: 高级功能
- [ ] 数据导出
- [ ] 网站设置
- [ ] SEO 优化工具
- [ ] 统计分析
- [ ] 主题定制

## 扩展指南

### 添加新的管理页面

1. 在 `app/admin/` 下创建新的页面文件
2. 在 `app/admin/layout.tsx` 的 `menuItems` 中添加菜单项
3. 使用 Prisma 查询数据
4. 使用 Tailwind 构建 UI

### 实现文章编辑器

推荐使用以下 Markdown 编辑器：
- [react-markdown-editor-lite](https://github.com/HarryChen0506/react-markdown-editor-lite)
- [react-simplemde-editor](https://github.com/RIP21/react-simplemde-editor)
- [novel](https://github.com/steven-tey/novel) - Notion 风格编辑器

### 添加图片上传

推荐集成：
- **Cloudinary**: 云端图片托管
- **AWS S3**: 对象存储
- **本地存储**: 使用 Next.js API Routes

## 常见问题

### 1. 忘记管理员密码怎么办？

重新运行创建管理员脚本：
```bash
node scripts/create-admin.js
```

或在数据库中直接更新密码哈希。

### 2. 如何修改密码？

使用 bcryptjs 生成新的密码哈希：
```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('new-password', 10);
console.log(hash);
```

然后在数据库中更新 `password_hash` 字段。

### 3. 如何添加更多管理员？

- 通过数据库直接创建用户
- 在 `user_roles` 表中分配 admin 角色
- 或修改 `scripts/create-admin.js` 脚本

### 4. 后台页面样式不对？

确保 Tailwind CSS 配置正确，并且已运行 `npm run dev`。

## 安全建议

1. **生产环境**:
   - 修改默认管理员密码
   - 使用强密码策略
   - 定期更新依赖包
   - 启用 HTTPS

2. **密码管理**:
   - 最小长度 8 位
   - 包含大小写字母、数字和特殊字符
   - 定期更换密码

3. **会话管理**:
   - 默认会话有效期 30 天
   - 可在 `lib/auth.ts` 中修改

4. **访问控制**:
   - 只有 admin 和 editor 角色可访问后台
   - 在 `lib/auth.ts` 中配置

## 贡献指南

欢迎贡献代码！建议的改进方向：

1. 完善文章编辑器
2. 添加富文本编辑支持
3. 实现批量操作
4. 添加数据导出功能
5. 改进 UI/UX 设计

## License

MIT

---

**需要帮助？** 查看项目的 README.md 或提交 Issue。
