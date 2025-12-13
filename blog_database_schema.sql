-- 博客系统数据库设计
-- 包含用户管理、文章管理、文章评论管理等功能
-- 使用UTF8MB4字符集支持Emoji，InnoDB存储引擎

-- 如果存在旧表，先删除（仅用于开发环境）
-- SET FOREIGN_KEY_CHECKS = 0;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名（唯一）',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱地址（唯一）',
  `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希（bcrypt）',
  `display_name` VARCHAR(100) NOT NULL COMMENT '显示名称',
  `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
  `bio` TEXT DEFAULT NULL COMMENT '个人简介',
  `status` ENUM('active', 'inactive', 'banned') NOT NULL DEFAULT 'active' COMMENT '用户状态',
  `email_verified` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '邮箱是否验证',
  `last_login_at` DATETIME DEFAULT NULL COMMENT '最后登录时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2. 角色表
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` VARCHAR(50) NOT NULL COMMENT '角色名称（唯一）',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '角色描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 3. 用户角色关联表
CREATE TABLE IF NOT EXISTS `user_roles` (
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `role_id` INT UNSIGNED NOT NULL COMMENT '角色ID',
  `assigned_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
  PRIMARY KEY (`user_id`, `role_id`),
  KEY `idx_role_id` (`role_id`),
  CONSTRAINT `fk_user_roles_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role_id` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 4. 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  `name` VARCHAR(100) NOT NULL COMMENT '分类名称',
  `slug` VARCHAR(100) NOT NULL COMMENT '分类URL别名（唯一）',
  `description` TEXT DEFAULT NULL COMMENT '分类描述',
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父分类ID',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_categories_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章分类表';

-- 5. 文章表
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文章ID',
  `title` VARCHAR(255) NOT NULL COMMENT '文章标题',
  `slug` VARCHAR(255) NOT NULL COMMENT '文章URL别名（唯一）',
  `content` LONGTEXT NOT NULL COMMENT '文章内容（Markdown格式）',
  `excerpt` TEXT DEFAULT NULL COMMENT '文章摘要',
  `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图片URL',
  `author_id` INT UNSIGNED NOT NULL COMMENT '作者ID',
  `category_id` INT UNSIGNED DEFAULT NULL COMMENT '分类ID',
  `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft' COMMENT '文章状态',
  `comment_status` ENUM('open', 'closed', 'logged_in_only') NOT NULL DEFAULT 'open' COMMENT '评论状态',
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览数',
  `like_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  `comment_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '评论数',
  `keywords` VARCHAR(255) DEFAULT NULL COMMENT 'SEO关键词',
  `description` VARCHAR(500) DEFAULT NULL COMMENT 'SEO描述',
  `published_at` DATETIME DEFAULT NULL COMMENT '发布时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  KEY `idx_author_id` (`author_id`),
  KEY `idx_category_id` (`category_id`),
  KEY `idx_status` (`status`),
  KEY `idx_published_at` (`published_at`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_view_count` (`view_count`),
  FULLTEXT KEY `ft_title_content` (`title`, `content`, `excerpt`),
  CONSTRAINT `fk_articles_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_articles_category_id` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 6. 标签表
CREATE TABLE IF NOT EXISTS `tags` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '标签ID',
  `name` VARCHAR(50) NOT NULL COMMENT '标签名称',
  `slug` VARCHAR(50) NOT NULL COMMENT '标签URL别名（唯一）',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '标签描述',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_slug` (`slug`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='标签表';

-- 7. 文章标签关联表
CREATE TABLE IF NOT EXISTS `article_tags` (
  `article_id` INT UNSIGNED NOT NULL COMMENT '文章ID',
  `tag_id` INT UNSIGNED NOT NULL COMMENT '标签ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`article_id`, `tag_id`),
  KEY `idx_tag_id` (`tag_id`),
  CONSTRAINT `fk_article_tags_article_id` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_article_tags_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章标签关联表';

-- 8. 评论表
CREATE TABLE IF NOT EXISTS `comments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  `content` TEXT NOT NULL COMMENT '评论内容',
  `article_id` INT UNSIGNED NOT NULL COMMENT '文章ID',
  `user_id` INT UNSIGNED DEFAULT NULL COMMENT '用户ID（匿名评论则为NULL）',
  `parent_id` INT UNSIGNED DEFAULT NULL COMMENT '父评论ID（支持层级评论）',
  `author_name` VARCHAR(100) DEFAULT NULL COMMENT '作者名称（匿名评论时使用）',
  `author_email` VARCHAR(100) DEFAULT NULL COMMENT '作者邮箱（匿名评论时使用）',
  `author_website` VARCHAR(255) DEFAULT NULL COMMENT '作者网站（匿名评论时使用）',
  `ip_address` VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` TEXT DEFAULT NULL COMMENT '用户代理',
  `status` ENUM('pending', 'approved', 'spam', 'trash') NOT NULL DEFAULT 'pending' COMMENT '评论状态',
  `like_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_article_id` (`article_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_article_status` (`article_id`, `status`),
  CONSTRAINT `fk_comments_article_id` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comments_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comments_parent_id` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 9. 文章点赞表（记录用户点赞，防止重复点赞）
CREATE TABLE IF NOT EXISTS `article_likes` (
  `article_id` INT UNSIGNED NOT NULL COMMENT '文章ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`article_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_article_likes_article_id` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_article_likes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章点赞记录表';

-- 10. 评论点赞表
CREATE TABLE IF NOT EXISTS `comment_likes` (
  `comment_id` INT UNSIGNED NOT NULL COMMENT '评论ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '用户ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',
  PRIMARY KEY (`comment_id`, `user_id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_comment_likes_comment_id` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_comment_likes_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞记录表';

-- 11. 附件/媒体表（用于图片、文件等）
CREATE TABLE IF NOT EXISTS `media` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '媒体ID',
  `filename` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `file_path` VARCHAR(255) NOT NULL COMMENT '文件存储路径',
  `file_type` VARCHAR(100) NOT NULL COMMENT '文件类型',
  `file_size` INT UNSIGNED NOT NULL COMMENT '文件大小（字节）',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'MIME类型',
  `uploaded_by` INT UNSIGNED DEFAULT NULL COMMENT '上传用户ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  KEY `idx_file_type` (`file_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_media_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体文件表';

-- 初始化数据
-- 插入默认角色
INSERT INTO `roles` (`name`, `description`) VALUES
('admin', '管理员，拥有所有权限'),
('editor', '编辑，可以发布和管理文章'),
('author', '作者，可以发布自己的文章'),
('subscriber', '订阅者，可以评论和点赞');

-- 插入默认分类
INSERT INTO `categories` (`name`, `slug`, `description`, `sort_order`) VALUES
('未分类', 'uncategorized', '默认分类', 0),
('技术', 'technology', '技术相关文章', 1),
('生活', 'life', '生活相关文章', 2),
('旅行', 'travel', '旅行相关文章', 3);

-- 插入默认标签
INSERT INTO `tags` (`name`, `slug`, `description`) VALUES
('JavaScript', 'javascript', 'JavaScript相关'),
('Node.js', 'nodejs', 'Node.js相关'),
('Express', 'express', 'Express框架'),
('MySQL', 'mysql', 'MySQL数据库'),
('编程', 'programming', '编程相关');

-- 创建管理员用户（密码为admin123，实际使用时应使用bcrypt生成哈希）
-- INSERT INTO `users` (`username`, `email`, `password_hash`, `display_name`, `status`, `email_verified`)
-- VALUES ('admin', 'admin@example.com', '$2b$10$YourBcryptHashHere', '管理员', 'active', TRUE);

-- 给管理员用户分配admin角色
-- INSERT INTO `user_roles` (`user_id`, `role_id`)
-- SELECT u.id, r.id FROM users u, roles r WHERE u.username = 'admin' AND r.name = 'admin';

-- 开启外键检查
-- SET FOREIGN_KEY_CHECKS = 1;

-- 表结构说明
/*
1. users - 用户表：存储用户基本信息
2. roles - 角色表：定义用户角色
3. user_roles - 用户角色关联表：用户和角色的多对多关系
4. categories - 分类表：文章分类，支持层级结构
5. articles - 文章表
6. tags - 标签表：文章标签
7. article_tags - 文章标签关联表：文章和标签的多对多关系
8. comments - 评论表：支持层级评论，匿名和注册用户评论
9. article_likes - 文章点赞表：记录用户点赞，防止重复点赞
10. comment_likes - 评论点赞表：记录评论点赞
11. media - 媒体表：存储上传的图片、文件等
*/
