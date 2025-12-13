const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('开始创建管理员用户...\n');

    // 检查admin角色是否存在
    let adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      console.log('创建admin角色...');
      adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: '管理员，拥有所有权限',
        },
      });
      console.log('✓ Admin角色创建成功\n');
    } else {
      console.log('✓ Admin角色已存在\n');
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (existingUser) {
      console.log('⚠ 管理员用户已存在: admin@example.com');
      console.log('用户名:', existingUser.username);
      console.log('显示名称:', existingUser.displayName);

      // 检查是否已有admin角色
      const hasAdminRole = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: existingUser.id,
            roleId: adminRole.id,
          },
        },
      });

      if (!hasAdminRole) {
        await prisma.userRole.create({
          data: {
            userId: existingUser.id,
            roleId: adminRole.id,
          },
        });
        console.log('✓ 已为现有用户添加admin角色');
      }

      return;
    }

    // 创建密码哈希
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建管理员用户
    console.log('创建管理员用户...');
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash,
        displayName: '管理员',
        status: 'active',
        emailVerified: true,
      },
    });
    console.log('✓ 管理员用户创建成功\n');

    // 分配admin角色
    console.log('分配admin角色...');
    await prisma.userRole.create({
      data: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    });
    console.log('✓ Admin角色分配成功\n');

    console.log('========================================');
    console.log('✅ 管理员账号创建成功！');
    console.log('========================================');
    console.log('登录信息:');
    console.log('  邮箱: admin@example.com');
    console.log('  密码: admin123');
    console.log('========================================');
    console.log('\n请访问: http://localhost:3000/admin/login');
    console.log('使用以上账号密码登录后台管理系统');
    console.log('\n⚠️  请在生产环境中修改此密码！\n');

  } catch (error) {
    console.error('创建管理员用户失败:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
