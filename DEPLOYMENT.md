# GitHub Actions 自动部署配置指南

本文档说明如何配置 GitHub Actions 自动部署到你的服务器。

## 📋 部署流程

1. **推送代码到 main 分支**
2. **自动触发构建** (`build.yml`)
3. **构建成功后自动部署** (`deploy.yml`)
4. **通过 SSH 上传文件到服务器**
5. **自动重启应用**

## 🔑 必需的 GitHub Secrets

在 GitHub 仓库设置中添加以下 secrets：

### 1. 进入 Secrets 设置

```
你的仓库 → Settings → Secrets and variables → Actions → New repository secret
```

### 2. 配置以下 Secrets

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SSH_HOST` | 服务器 IP 地址或域名 | `123.45.67.89` 或 `your-server.com` |
| `SSH_USERNAME` | SSH 登录用户名 | `root` 或 `ubuntu` |
| `SSH_PRIVATE_KEY` | SSH 私钥（完整内容） | 见下文生成方法 |
| `SSH_PORT` | SSH 端口（可选，默认 22） | `22` |
| `DEPLOY_PATH` | 服务器上的部署目录 | `/var/www/blog` |
| `HEALTH_CHECK_URL` | 健康检查 URL（可选） | `https://your-blog.com` |

## 🔐 生成 SSH 密钥对

### 在本地生成密钥

```bash
# 生成新的 SSH 密钥对（不要设置密码）
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# 这会生成两个文件：
# - github_actions_deploy       (私钥) ← 添加到 GitHub Secrets
# - github_actions_deploy.pub   (公钥) ← 添加到服务器
```

### 将公钥添加到服务器

```bash
# 方法1：使用 ssh-copy-id（推荐）
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server.com

# 方法2：手动添加
# 1. 查看公钥内容
cat ~/.ssh/github_actions_deploy.pub

# 2. 登录服务器
ssh user@your-server.com

# 3. 将公钥添加到 authorized_keys
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 将私钥添加到 GitHub Secrets

```bash
# 复制私钥内容
cat ~/.ssh/github_actions_deploy

# 完整复制输出内容（包括 -----BEGIN 和 -----END 行）
# 然后在 GitHub 仓库添加为 SSH_PRIVATE_KEY secret
```

## 🖥️ 服务器准备

### 1. 安装必需软件

```bash
# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v

# 安装 PM2（进程管理器）
sudo npm install -g pm2

# 配置 PM2 开机自启
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 2. 创建部署目录

```bash
# 创建应用目录
sudo mkdir -p /var/www/blog

# 设置权限
sudo chown -R $USER:$USER /var/www/blog
```

### 3. 配置环境变量

在服务器上创建 `.env` 文件：

```bash
cd /var/www/blog

# 创建 .env 文件
cat > .env << 'EOF'
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# Node Environment
NODE_ENV="production"
EOF

# 设置权限
chmod 600 .env
```

### 4. 配置 PM2

首次手动启动应用：

```bash
cd /var/www/blog

# 首次部署需要手动安装依赖
npm ci --omit=dev
npx prisma generate

# 启动应用
pm2 start npm --name "blog" -- start

# 保存 PM2 配置
pm2 save

# 查看状态
pm2 status
pm2 logs blog
```

## 🔒 服务器安全配置（推荐）

### 1. 配置防火墙

```bash
# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

### 2. 禁用密码登录（仅使用密钥）

```bash
# 编辑 SSH 配置
sudo nano /etc/ssh/sshd_config

# 修改以下配置：
# PasswordAuthentication no
# PubkeyAuthentication yes

# 重启 SSH 服务
sudo systemctl restart sshd
```

## 🚀 测试部署

### 手动触发部署测试

1. 提交一个小改动到 main 分支：

```bash
git commit --allow-empty -m "test: trigger deployment"
git push origin main
```

2. 在 GitHub Actions 页面查看运行状态：
   - `Build Next.js Application` 应该先运行
   - 构建成功后 `Deploy to Production` 自动运行

3. 检查服务器状态：

```bash
# 查看 PM2 状态
pm2 status

# 查看应用日志
pm2 logs blog --lines 50

# 测试访问
curl http://localhost:3000
```

## 📝 常见问题

### 1. 部署失败：Permission denied

**原因**：SSH 密钥权限问题

**解决**：
```bash
# 在服务器上检查权限
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 2. 应用无法启动

**原因**：环境变量或依赖问题

**解决**：
```bash
cd /var/www/blog

# 检查 .env 文件是否存在
cat .env

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install --omit=dev

# 检查 PM2 日志
pm2 logs blog
```

### 3. 数据库连接失败

**原因**：DATABASE_URL 配置错误

**解决**：
```bash
# 检查数据库连接
mysql -u username -p -h localhost database_name

# 更新 .env 中的 DATABASE_URL
nano /var/www/blog/.env
```

### 4. 健康检查失败

**原因**：应用未正确启动或 URL 配置错误

**解决**：
- 检查 PM2 状态：`pm2 status`
- 检查应用是否监听正确端口：`netstat -tlnp | grep 3000`
- 更新 `HEALTH_CHECK_URL` secret

## 🎯 下一步

- [ ] 配置 Nginx 反向代理
- [ ] 设置 SSL 证书（Let's Encrypt）
- [ ] 配置自动备份
- [ ] 添加监控告警

## 📚 相关文档

- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Prisma 生产环境指南](https://www.prisma.io/docs/guides/deployment/deployment-guides)
