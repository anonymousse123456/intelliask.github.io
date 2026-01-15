#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "=== Vercel Project Info ==="
cat .vercel/project.json 2>/dev/null | python3 -m json.tool

echo ""
echo "=== Your Vercel URL ==="
echo "https://intelliask-backend.vercel.app"
echo ""
echo "=== Next Steps ==="
echo "1. Update static/js/index.js line 44 with:"
echo "   'https://intelliask-backend.vercel.app/api'"
echo ""
echo "2. Test the backend:"
echo "   curl https://intelliask-backend.vercel.app/api/upload -X OPTIONS"
echo ""
echo "3. Push to GitHub (already done!)"
