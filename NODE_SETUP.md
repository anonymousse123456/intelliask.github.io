# Node.js and Vercel CLI Setup

## Issue: Node.js Version Too Old

Vercel CLI requires Node.js 20 or higher, but you had v18.19.1.

## Solution: Using NVM (Node Version Manager)

NVM was installed and Node.js 20 is now active!

### What Was Done

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Load NVM and install Node.js 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20

# Install Vercel CLI
npm install -g vercel
```

### Verify Installation

```bash
node --version   # Should show v20.x.x
npm --version    # Should show v10.x.x
vercel --version # Should show 50.x.x
```

## Using Node.js 20 in Your Shell

### For Current Terminal Session Only

Run this before using Vercel:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20
```

### Make Node.js 20 Default (Recommended)

NVM should have already added this to your `~/.bashrc`. To verify:

```bash
cat ~/.bashrc | grep -A 3 "NVM_DIR"
```

You should see:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

### For New Terminal Windows

Just close and reopen your terminal, or run:
```bash
source ~/.bashrc
```

Then verify:
```bash
node --version  # Should show v20.20.0
```

## Quick Deploy Script (with NVM)

Create a helper script to ensure Node.js 20 is used:

```bash
#!/bin/bash
# deploy.sh - Deploy to Vercel with correct Node.js version

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

vercel --prod
```

Make it executable:
```bash
chmod +x deploy.sh
```

Run it:
```bash
./deploy.sh
```

## Troubleshooting

### "nvm: command not found"

Run this to load NVM:
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Or restart your terminal.

### "vercel: command not found"

Make sure you're using Node.js 20:
```bash
nvm use 20
npm install -g vercel
```

### Switch Between Node.js Versions

```bash
# List installed versions
nvm list

# Switch to version 18
nvm use 18

# Switch to version 20
nvm use 20

# Use Node.js 20 by default
nvm alias default 20
```

## Next Steps

Now that Vercel CLI is installed, follow the deployment guide:

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy**:
   ```bash
   cd /home/vidusheevats/Documents/intelliask.github.io
   vercel --prod
   ```

3. **Add Environment Variable**:
   ```bash
   vercel env add GEMINI_API_KEY
   ```

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

See [QUICK_START.md](QUICK_START.md) for complete deployment instructions.
