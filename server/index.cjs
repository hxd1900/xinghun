const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from dist directory (production)
app.use(express.static(path.join(__dirname, '../dist')));

// Database Setup
const dbPath = path.resolve(__dirname, 'xinghun.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create profiles table if not exists
    db.run(`CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gender TEXT,
      age INTEGER,
      city TEXT,
      education TEXT,
      occupation TEXT,
      coming_out TEXT,
      personality TEXT,
      income TEXT,
      housing_car TEXT,
      gift TEXT,
      wedding TEXT,
      certificate TEXT,
      children TEXT,
      live_together TEXT,
      family_atmosphere TEXT,
      cooperation_freq TEXT,
      duration TEXT,
      appearance TEXT,
      difficulty_score REAL,
      difficulty_level TEXT,
      requirements TEXT,
      ip TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (!err) {
        // Try to add 'requirements' and 'ip' columns if they don't exist
        db.run(`ALTER TABLE profiles ADD COLUMN requirements TEXT`, (err) => {
          // Ignore error "duplicate column name"
        });
        db.run(`ALTER TABLE profiles ADD COLUMN ip TEXT`, (err) => {
          // Ignore error "duplicate column name"
        });
      }
    });
  }
});

// API Routes

// Root path - Serve frontend in production, show admin entry in dev
app.get('/', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  } else {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>形婚难度测算 - 数据后台</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 500px;
      width: 100%;
    }
    .card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 50px 40px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 25px;
    }
    .icon svg {
      width: 40px;
      height: 40px;
      color: white;
    }
    h1 {
      color: white;
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 16px 40px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
    }
    .btn:active {
      transform: translateY(0);
    }
    .links {
      margin-top: 35px;
      display: flex;
      gap: 20px;
      justify-content: center;
      flex-wrap: wrap;
    }
    .link {
      color: rgba(255, 255, 255, 0.5);
      text-decoration: none;
      font-size: 13px;
      transition: color 0.3s;
    }
    .link:hover {
      color: rgba(255, 255, 255, 0.8);
    }
    .api-info {
      margin-top: 30px;
      padding-top: 25px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: left;
    }
    .api-info h3 {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin-bottom: 12px;
    }
    .api-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .method {
      background: rgba(102, 126, 234, 0.2);
      color: #667eea;
      padding: 3px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .path {
      color: rgba(255, 255, 255, 0.6);
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
      </div>
      <h1>形婚难度测算</h1>
      <p>欢迎使用数据管理后台，查看用户提交的数据统计和分析。</p>
      <a href="/admin" class="btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        进入管理后台
      </a>
      
      <div class="api-info">
        <h3>API 端点</h3>
        <div class="api-item">
          <span class="method">POST</span>
          <span class="path">/api/profiles</span>
        </div>
        <div class="api-item">
          <span class="method">GET</span>
          <span class="path">/api/stats</span>
        </div>
        <div class="api-item">
          <span class="method">GET</span>
          <span class="path">/api/profiles</span>
        </div>
      </div>
    </div>
    <div class="links">
      <a href="/" class="link">前端首页</a>
      <a href="/admin" class="link">数据管理</a>
    </div>
  </div>
</body>
</html>
  `;
    res.send(html);
  }
});

// 1. Submit Profile
app.post('/api/profiles', (req, res) => {
  const {
    gender, age, city, education, occupation, comingOut, personalitySelf,
    income, housingCar, gift, wedding, certificate, children,
    liveTogether, familyAtmosphere, cooperationFreq, duration, appearanceSelf,
    difficultyScore, difficultyLevel, weights
  } = req.body;

  // Get client IP address
  const clientIp = req.ip || 
                    req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null);

  const sql = `INSERT INTO profiles (
    gender, age, city, education, occupation, coming_out, personality,
    income, housing_car, gift, wedding, certificate, children,
    live_together, family_atmosphere, cooperation_freq, duration, appearance,
    difficulty_score, difficulty_level, requirements, ip
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const params = [
    gender, age, city, education, occupation, comingOut, personalitySelf,
    income, housingCar, gift, wedding, certificate, children,
    liveTogether, familyAtmosphere, cooperationFreq, duration, appearanceSelf,
    difficultyScore, difficultyLevel,
    JSON.stringify(weights || {}),
    clientIp
  ];

  db.run(sql, params, function(err) {
    if (err) {
      console.error(err.message);
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: req.body,
      id: this.lastID
    });
  });
});

// Helper: Get raw profiles (no deduplication)
const getRawProfiles = async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM profiles ORDER BY created_at DESC', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper: Get deduplicated profiles (keep latest for each unique user - use IP as identifier)
const getDeduplicatedProfiles = async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM profiles ORDER BY created_at DESC', [], (err, allRows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const seen = new Set();
      const deduplicated = [];
      
      for (const row of allRows) {
        const userKey = row.ip || `${row.gender}-${row.age}-${row.city}-${row.education}`;
        if (!seen.has(userKey)) {
          seen.add(userKey);
          deduplicated.push(row);
        }
      }
      
      resolve(deduplicated);
    });
  });
};

// 2. Get Stats for Dashboard (Deduplicated)
app.get('/api/stats', (req, res) => {
  const stats = {};

  (async () => {
    try {
      const deduplicated = await getDeduplicatedProfiles();
      
      // Total Count
      stats.totalUsers = deduplicated.length;

      // Avg Difficulty
      const avgScore = deduplicated.length > 0 
        ? deduplicated.reduce((sum, r) => sum + (r.difficulty_score || 0), 0) / deduplicated.length 
        : 0;
      stats.avgDifficulty = avgScore.toFixed(1);

      // Gender Distribution
      const genderMap = {};
      deduplicated.forEach(r => {
        if (r.gender) genderMap[r.gender] = (genderMap[r.gender] || 0) + 1;
      });
      stats.genderDist = Object.entries(genderMap).map(([gender, count]) => ({ gender, count }));

      // Age Distribution (Specific Age)
      const ageMap = {};
      deduplicated.forEach(r => {
        if (r.age !== null && r.age !== undefined && r.age !== '') {
          const ageStr = String(r.age);
          ageMap[ageStr] = (ageMap[ageStr] || 0) + 1;
        }
      });
      stats.ageDist = Object.entries(ageMap)
        .map(([ageGroup, count]) => ({ ageGroup, count }))
        .sort((a, b) => parseInt(a.ageGroup) - parseInt(b.ageGroup));

      // Difficulty Level Distribution
      const levelMap = {};
      deduplicated.forEach(r => {
        if (r.difficulty_level) levelMap[r.difficulty_level] = (levelMap[r.difficulty_level] || 0) + 1;
      });
      stats.levelDist = Object.entries(levelMap).map(([name, count]) => ({ name, count }));

      // City Top 5
      const cityMap = {};
      deduplicated.forEach(r => {
        if (r.city && r.city !== '') cityMap[r.city] = (cityMap[r.city] || 0) + 1;
      });
      stats.topCities = Object.entries(cityMap)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Requirements Distribution (Calculate avg for each dimension)
      const reqStats = {};
      const reqCounts = {};

      deduplicated.forEach(row => {
        if (row.requirements && row.requirements !== '') {
          try {
            const w = JSON.parse(row.requirements);
            Object.keys(w).forEach(key => {
              reqStats[key] = (reqStats[key] || 0) + w[key];
              reqCounts[key] = (reqCounts[key] || 0) + 1;
            });
          } catch (e) {
            // ignore parsing errors
          }
        }
      });

      const dimensionLabels = {
        age: '年龄', appearance: '外貌', education: '学历', personality: '性格', comingOut: '出柜',
        income: '收入', housing: '房产', car: '车辆', wedding: '婚礼', family: '家庭', duration: '长久'
      };

      stats.requirementsDist = Object.keys(reqStats).map(key => ({
        subject: dimensionLabels[key] || key,
        A: reqCounts[key] ? Math.round(reqStats[key] / reqCounts[key]) : 0,
        fullMark: 100
      }));

      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })();
});

// 3. Get Recent Profiles (List - Deduplicated, max 100)
app.get('/api/profiles', (req, res) => {
  (async () => {
    try {
      const deduplicated = await getDeduplicatedProfiles();
      res.json({
        message: 'success',
        data: deduplicated.slice(0, 100)
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  })();
});

// 4. Get All Profiles (For Export - Deduplicated, No Limit)
app.get('/api/profiles/all', (req, res) => {
  (async () => {
    try {
      const deduplicated = await getDeduplicatedProfiles();
      res.json({
        message: 'success',
        data: deduplicated
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  })();
});

// Catch-all: Serve frontend for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
