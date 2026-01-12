#!/bin/bash

# 测试构建产物脚本
# 用于本地验证 GitHub Actions 构建产物是否正确

set -e

echo "🧪 Testing Build Artifacts"
echo "=========================="
echo ""

# 1. 清理旧的构建
echo "🧹 Cleaning old build..."
rm -rf .next
echo "✅ Cleaned"
echo ""

# 2. 运行构建
echo "🔨 Building application..."
DATABASE_URL="mysql://placeholder:placeholder@localhost:3306/placeholder" npm run build
echo "✅ Build completed"
echo ""

# 3. 验证 .next 目录
echo "🔍 Verifying .next directory..."
if [ ! -d ".next" ]; then
    echo "❌ Error: .next directory not found!"
    exit 1
fi

echo "✅ .next directory exists"
echo "📊 Build output structure:"
ls -lh .next/ | head -15
echo ""

echo "📁 .next directory size:"
du -sh .next/
echo ""

# 4. 模拟打包（像 GitHub Actions 那样）
echo "📦 Creating artifact package..."
tar -czf test-artifacts.tar.gz .next package.json package-lock.json prisma public
echo "✅ Package created: test-artifacts.tar.gz"
ls -lh test-artifacts.tar.gz
echo ""

# 5. 创建测试目录并解压
echo "🔓 Testing artifact extraction..."
mkdir -p test-extract
cd test-extract
tar -xzf ../test-artifacts.tar.gz
echo "✅ Extracted successfully"
echo ""

# 6. 验证解压后的内容
echo "🔍 Verifying extracted files..."
MISSING=()

if [ ! -d ".next" ]; then
    echo "❌ .next/ directory is MISSING!"
    MISSING+=(".next/")
else
    echo "✅ .next/ directory found"
    du -sh .next/
fi

[ -f "package.json" ] && echo "✅ package.json found" || MISSING+=("package.json")
[ -f "package-lock.json" ] && echo "✅ package-lock.json found" || MISSING+=("package-lock.json")
[ -d "prisma" ] && echo "✅ prisma/ directory found" || MISSING+=("prisma/")
[ -d "public" ] && echo "✅ public/ directory found" || MISSING+=("public/")

if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "❌ ERROR: Missing files/directories after extraction:"
    printf '  - %s\n' "${MISSING[@]}"
    cd ..
    rm -rf test-extract test-artifacts.tar.gz
    exit 1
fi

echo ""
echo "📂 Extracted directory structure:"
ls -lh
echo ""

# 7. 清理
cd ..
rm -rf test-extract test-artifacts.tar.gz
echo "🧹 Cleaned up test files"
echo ""

# 8. 总结
echo "================================"
echo "✅ All tests passed successfully!"
echo "================================"
echo ""
echo "📝 Summary:"
echo "  - Build completed successfully"
echo "  - .next directory created"
echo "  - All required files present"
echo "  - Packaging and extraction works"
echo ""
echo "💡 Your build artifacts are ready for GitHub Actions!"
