// scripts/contribution_summary.js

// Fetch commits from GitHub API
async function fetchCommits(owner, repo) {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits`);
  const data = await response.json();
  return data;
}

// Parse commits into useful data
function parseCommits(commits) {
  const contributionData = {};

  commits.forEach(commit => {
    const author = commit.author ? `@${commit.author.login}` : "Unknown";
    const date = new Date(commit.commit.author.date);

    // GitHub commit list does not show files in this lightweight API unless we fetch each commit separately
    // So for now, we assume one commit per group
    const fileName = commit.commit.message.split(":")[0] || "Unknown file";

    if (!contributionData[fileName]) {
      contributionData[fileName] = {
        lastEditor: author,
        edits: 1,
        isHotspot: false,
        lastEditedDaysAgo: Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)),
        owner: {
          username: author,
          percentage: 100
        }
      };
    } else {
      contributionData[fileName].edits++;
      const existingLastDate = contributionData[fileName].lastEditedDaysAgo;
      const newLastDate = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (newLastDate < existingLastDate) {
        contributionData[fileName].lastEditor = author;
        contributionData[fileName].lastEditedDaysAgo = newLastDate;
      }
    }
  });

  return contributionData;
}

// Create a single contribution card
function createContributionCard(filePath, data) {
  const card = document.createElement("div");
  card.className = "contribution-card fade-in";

  const hotspot = data.isHotspot ? `<span class="hotspot">🔥 Hotspot</span>` : "";

  card.innerHTML = `
    <div class="card-header">
      <img class="card-icon" src="https://cdn-icons-png.flaticon.com/512/1828/1828817.png" />
      <div class="file-path">${filePath}</div>
    </div>
    <div class="card-body">
      <div class="info-line">👤 <strong>${data.lastEditor}</strong> — 🔁 ${data.edits} edits ${hotspot}</div>
      <div class="info-line">🕑 Last edited: ${data.lastEditedDaysAgo} days ago</div>
      <div class="info-line">👑 Owner: ${data.owner.username} (${data.owner.percentage}%)</div>
    </div>
  `;

  return card;
}

// Insert all contribution cards into GitHub page
async function insertContributionCards() {
  const targetContainer = document.querySelector("#readme, .repository-content") || document.body;

  // Avoid duplicating cards
  if (document.querySelector(".contribution-card")) return;

  const urlParts = window.location.pathname.split("/");
  if (urlParts.length < 3) return; // not on a repo page

  const owner = urlParts[1];
  const repo = urlParts[2];

  try {
    const commits = await fetchCommits(owner, repo);
    const parsedData = parseCommits(commits);

    for (const filePath in parsedData) {
      const contributionInfo = parsedData[filePath];
      const cardElement = createContributionCard(filePath, contributionInfo);
      targetContainer.appendChild(cardElement);
    }
  } catch (error) {
    console.error("Error fetching commits:", error);
  }
}

// Add custom styles
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .contribution-card {
      margin: 12px;
      padding: 15px;
      border: 1px solid #e1e4e8;
      border-radius: 10px;
      background: #fdfdfd;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      width: 300px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      color: #24292f;
      animation: fadeIn 0.8s ease forwards;
      opacity: 0;
    }
    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .card-icon {
      width: 28px;
      height: 28px;
      margin-right: 10px;
    }
    .file-path {
      font-weight: 600;
      font-size: 16px;
      color: #0366d6;
    }
    .card-body .info-line {
      margin: 4px 0;
    }
    .hotspot {
      background: #ffdfdf;
      color: #d73a49;
      padding: 2px 6px;
      margin-left: 6px;
      border-radius: 5px;
      font-size: 12px;
    }
    @keyframes fadeIn {
      to {
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

// Observe page changes (for GitHub SPA navigation)
const observer = new MutationObserver(() => {
  insertContributionCards();
});

observer.observe(document.body, { childList: true, subtree: true });

// Inject styles once
injectStyles();

// Insert cards on load
insertContributionCards();
