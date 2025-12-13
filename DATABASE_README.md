# 博客系统数据库设计

## 概述

本文档提供了完整的博客系统数据库设计，包含用户管理、文章管理、文章评论管理等功能。设计目标是创建一个可扩展、性能良好且安全的数据库结构。

## 文件说明

- `blog_database_schema.sql` - 完整的数据库创建SQL脚本

## 数据库表结构

### 核心表 (11张表)

1. **users** - 用户表
   - 用户基本信息，支持邮箱验证、状态管理
   - 密码使用bcrypt哈希存储

2. **roles** - 角色表
   - 预定义角色：admin, editor, author, subscriber

3. **user_roles** - 用户角色关联表
   - 用户和角色的多对多关系

4. **categories** - 分类表
   - 文章分类，支持层级结构（父分类）

5. **articles** - 文章表
   - 支持草稿、发布、归档状态
   - 包含SEO字段（keywords, description）
   - 支持文章摘要、封面图

6. **tags** - 标签表
   - 文章标签管理

7. **article_tags** - 文章标签关联表
   - 文章和标签的多对多关系

8. **comments** - 评论表
   - 支持层级评论（回复功能）
   - 支持匿名评论和注册用户评论
   - 评论审核机制（pending/approved/spam/trash）

9. **article_likes** - 文章点赞表
   - 记录用户点赞，防止重复点赞

10. **comment_likes** - 评论点赞表
    - 记录评论点赞

11. **media** - 媒体表
    - 存储上传的图片、文件等

## 安装和使用

### 1. 应用数据库脚本

```bash
# 连接到MySQL数据库
mysql -h [host] -u [username] -p [database_name] < blog_database_schema.sql
```

### 2. 环境变量配置

确保在 `.env` 或环境变量中设置数据库连接信息：

```
DB_HOST=rm-bp1r11zh6j1nnf09l1o.mysql.rds.aliyuncs.com
DB_USER=xek
DB_PASSWORD=your_password_here
DB_NAME=xek
```

### 3. 代码适配

需要更新现有的 `db.js` 和相关控制器代码以使用新表结构：

## 默认数据

数据库脚本包含以下默认数据：

1. **角色**：admin, editor, author, subscriber
2. **分类**：未分类, 技术, 生活, 旅行
3. **标签**：JavaScript, Node.js, Express, MySQL, 编程

## 安全考虑

1. **密码存储**：使用bcrypt哈希算法
2. **SQL注入防护**：使用参数化查询（现有代码需要改进）
3. **权限控制**：基于角色的访问控制（RBAC）
4. **评论审核**：支持评论审核机制防止垃圾评论

## 性能优化

1. **索引**：所有外键和常用查询字段都已添加索引
2. **全文搜索**：articles表支持全文搜索（title, content, excerpt）
3. **计数器缓存**：articles表包含view_count, like_count, comment_count避免COUNT查询
4. **分表考虑**：comments表可能根据数据量需要考虑分表

## 扩展建议

1. **社交功能**：可添加用户关注、收藏功能
2. **通知系统**：评论回复通知、文章审核通知
3. **数据统计**：访问统计、用户行为分析
4. **API支持**：为前端应用提供RESTful API

## 注意事项

1. 在生产环境应用前，请在测试环境充分测试
2. 建议备份现有数据后再执行迁移
3. 根据实际业务需求调整字段长度和索引
4. 定期优化数据库表和维护索引