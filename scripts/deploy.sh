#!/bin/bash

# Configuration
PROJECT_NAME="teach-laoz-lms"
ARCHIVE_NAME="${PROJECT_NAME}_deploy.tar.gz"

echo "📦 Packaging project for deployment..."

# Create exclusion list
cat > .deployignore <<EOF
node_modules
.git
.github
dist
build
.env
.DS_Store
*.tar.gz
EOF

# Create tarball using git archive (cleanest way) if git is available, else tar manually
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "   Using git archive..."
    git archive --format=tar.gz -o "$ARCHIVE_NAME" HEAD
    # Add uncommitted files if necessary (like content) manually or ensure they are committed
    # checking for local content changes usually ignored by git
    tar -rf "${PROJECT_NAME}_deploy.tar" content/ docker-compose.prod.yml || echo "   Warning: Could not append extra files"
    gzip -f "${PROJECT_NAME}_deploy.tar"
else 
    echo "   Using tar..."
    tar --exclude-from='.deployignore' -czf "$ARCHIVE_NAME" .
fi

echo "✅ Package created: $ARCHIVE_NAME"
echo ""
echo "🚀 Deployment Instructions:"
echo "1. Upload the file to your server:"
echo "   scp $ARCHIVE_NAME user@your-server-ip:~/"
echo ""
echo "2. Connect to your server:"
echo "   ssh user@your-server-ip"
echo ""
echo "3. Run these commands on the server:"
echo "   mkdir -p $PROJECT_NAME"
echo "   tar -xzf $ARCHIVE_NAME -C $PROJECT_NAME"
echo "   cd $PROJECT_NAME"
echo "   docker-compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "Done!"
