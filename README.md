# Dev Ops Dashboard

Your personal ops center for CEO/Dev growth. Track tasks, habits, projects, learning, and opportunities in one place.

## Features

- **Today's Focus** – Prioritize and complete daily tasks (5 top items)
- **Habit Tracker** – Build streaks with automatic GitHub commit tracking
- **Project Pipeline** – Manage projects from idea → MVP → shipped
- **Learning Queue** – Curate resources and track progress
- **Opportunity Radar** – Scrape RSS feeds for new opportunities (TechCrunch, Dev.to, custom)
- **GitHub Stats** – Real-time repos, stars, forks
- **Authentication** – Simple password-based login
- **Settings** – Configure Telegram, automation schedule, RSS sources, GitHub token
- **CSV Export** – Export any widget data to CSV
- **PWA** – Installable on mobile (basic)

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Storage**: File-based JSON (no database required)
- **Auth**: Token-based (random UUIDs stored in `data/tokens.json`)
- **Automation**: Cron job (configured in Settings) – runs nightly at 2 AM PH

## Quick Start – Local Development

```bash
cd dev-ops-dashboard
npm install
npm run dev
# Open http://localhost:3000
```

Default login password: `admin123` (change immediately in Settings)

---

## Backend Deployment (to your VPS)

The dashboard uses a **separate backend** running on your VM. The frontend is hosted on Vercel and proxies API requests to your VM.

### 1. Prepare the VM

```bash
# SSH into your VM
ssh azureuser@<your-vm-ip>

# Navigate to workspace
cd /home/azureuser/.openclaw/workspace/dev-ops-dashboard

# Optional: switch to branch 'main' if needed
git checkout main
```

### 2. Deploy script

We provide a helper script:

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

That will:
- Pull latest changes (if inside a git repo)
- Install production dependencies
- Build the Next.js app
- Create the `data/` directory (chmod 755)
- Restart with PM2 if available, else start in background

### 3. Run as a service (recommended)

Use **PM2** for process management and auto-restart on boot:

```bash
# Install PM2 globally (if not installed)
sudo npm install -g pm2

# Start the app via the deploy script or manually:
pm2 start npm --name "dev-ops-dashboard" -- start

# Save PM2 process list
pm2 save

# Setup startup script (run once)
pm2 startup
# Follow the instructions it prints
```

Your app will now run on the VM's port `3001` (verify with `netstat -tulpn | grep :3001`).

### 4. Configure Environment

- Ensure the VM's firewall allows inbound traffic on port 3002 (or use SSH tunneling).
- Set `VERCEL_GIT_TOKEN` if deploying frontend via Vercel? Not needed here.

### 5. Update Vercel `vercel.json`

The Vercel project should have this rewrite:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "http://<your-vm-ip>:3001/api/$1" }
  ]
}
```

Replace `<your-vm-ip>` with your VM's public IP. This forwards all `/api/*` requests to your backend.

---

## Data & Storage

All data is stored as JSON files in the `data/` directory on the VM:

- `settings.json` – GitHub, Telegram, automation, RSS sources, MongoDB URI
- `tasks.json`, `habits.json`, `projects.json`, `learning.json`, `opportunities.json`
- `tokens.json` – valid login tokens
- `auth.json` – password hash (plain for now)

**Backup**: Regularly copy the `data/` folder to avoid data loss.

---

## Settings & Configuration

After first login (password `admin123`), go to **Settings (gear icon)** to configure:

1. **GitHub** – Enter your username and personal access token (for stats and commit tracking)
2. **Telegram** – Bot token and chat ID to receive daily briefs
3. **Automation** – Cron schedule for nightly tasks (default: `0 18 * * *` = 2 AM PH)
4. **RSS Sources** – Add news feeds to scrape opportunities
5. **MongoDB URI** – Optional future integration (currently unused)

Click **Test Telegram** to verify.

---

## Automation

Nightly at the scheduled time, a cron job will:

- Scrape all configured RSS sources and add new opportunities
- Generate a summary and send via Telegram (if configured)
- Update stats from GitHub

The automation runs **on the VM** as part of the same Node process. The schedule is stored in `data/settings.json` under `automation.schedule`. To change it, update Settings and Save.

---

## CSV Export

Each widget has an **Export** button in its header. Click to download all records in that category as CSV.

---

## PWA (Mobile)

The dashboard can be installed on your home screen. Look for the "Add to Home screen" prompt in your mobile browser (Chrome, Safari). The icon is a solid dark square with the letter D (placeholder – you can replace `public/icon-192x192.png` and `public/icon-512x512.png` with your own design).

---

## Security

- Change the default password immediately after login.
- Tokens are stored in plain text – keep your VM secure.
- Consider adding HTTPS reverse proxy (nginx) with TLS for production.
- The backend only accepts requests from Vercel frontend via same origin? Not enforced yet – you could restrict by origin or use a VPN.

---

## Adding New RSS Sources

In Settings → News Sources:
- Click "Add Source" after filling name and RSS feed URL.
- Press "Scrape Now" to manually fetch opportunities.

Supported types: RSS (`type: 'rss'`). Future: API sources.

---

## Troubleshooting

**Dashboard loads but no data** – Ensure your VM's backend is running and port 3002 is accessible.

**Telegram test fails** – Check bot token and chat ID. Ensure bot is not blocked.

**GitHub stats error** – Verify your GitHub token has `public_repo` scope.

**Automation not running** – Check VM logs: `pm2 logs dev-ops-dashboard`. Ensure cron schedule is valid.

**CSV export empty** – No data exists for that widget.

---

## License

MIT – feel free to modify.

---

## Credits

Built with Next.js, Tailwind CSS, and Node.js.
