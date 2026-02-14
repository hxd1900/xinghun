import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { Users, Activity, DollarSign, LayoutDashboard, LogOut, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Card = ({ title, value, icon, subtext }) => (
  <div className="bg-dark-800 border border-white/10 rounded-xl p-6 flex items-start justify-between shadow-lg">
    <div>
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
    <div className="p-3 bg-primary/10 rounded-lg text-primary">
      {icon}
    </div>
  </div>
);

function Admin() {
  const [stats, setStats] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    document.title = '数据后台 - 形婚难度测算';
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const [statsRes, profilesRes] = await Promise.all([
        axios.get(`${apiBase}/api/stats`),
        axios.get(`${apiBase}/api/profiles`)
      ]);
      setStats(statsRes.data);
      setProfiles(profilesRes.data.data);
    } catch (error) {
      console.error("Error fetching data", error);
      // Ensure we don't leave loading state hanging if error occurs
      setStats(null); 
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      const res = await axios.get(`${apiBase}/api/profiles/all`);
      const allProfiles = res.data.data;

      if (allProfiles.length === 0) {
        alert("没有数据可导出");
        return;
      }

      const headers = [
        "ID", "提交时间", "性别", "年龄", "城市", "学历", "职业", "出柜情况", "性格", 
        "收入", "房车", "礼金", "婚礼", "领证", "小孩", "同住", "家庭氛围", "互动频次", "长久度", "外貌自评", 
        "难度分", "难度等级", "需求权重(JSON)"
      ];

      const csvContent = [
        headers.join(','),
        ...allProfiles.map(row => [
          row.id,
          new Date(row.created_at).toLocaleString().replace(/,/g, ' '),
          row.gender,
          row.age,
          row.city,
          row.education,
          row.occupation,
          row.coming_out,
          row.personality,
          row.income,
          row.housing_car,
          row.gift,
          row.wedding,
          row.certificate,
          row.children,
          row.live_together,
          row.family_atmosphere,
          row.cooperation_freq,
          row.duration,
          row.appearance,
          row.difficulty_score,
          row.difficulty_level,
          `"${(row.requirements || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `xinghun_data_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error", error);
      alert("导出失败，请重试");
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple hardcoded password for demo
      setIsAuthenticated(true);
    } else {
      alert('密码错误');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="bg-dark-800 p-8 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">后台管理系统</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">管理员密码</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                placeholder="请输入密码"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">
        加载中...
      </div>
    );
  }

  // Handle case where data fetching failed or returned null
  if (!stats) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center text-white p-4">
        <div className="bg-red-500/10 p-4 rounded-full mb-4 text-red-400">
          <Activity size={32} />
        </div>
        <h2 className="text-xl font-bold mb-2">数据加载失败</h2>
        <p className="text-gray-400 text-center mb-6">
          无法连接到后端服务。请确保后端服务正在运行 (端口 3001)。
        </p>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            重试
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="px-6 py-2 bg-dark-800 text-gray-300 border border-white/10 rounded-lg font-bold hover:bg-white/5 transition-colors"
          >
            返回登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 font-sans">
      {/* Header */}
      <header className="bg-dark-800 border-b border-white/10 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-primary" />
          <h1 className="text-xl font-bold">后台数据看板</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData} 
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            <RefreshCcw size={14} /> 刷新
          </button>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
          >
            <LogOut size={14} /> 退出
          </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Key Metrics - Condensed */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-800 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-gray-400 text-xs font-medium">总用户数</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={20} />
            </div>
          </div>
          <div className="bg-dark-800 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-gray-400 text-xs font-medium">平均难度分</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.avgDifficulty}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Activity size={20} />
            </div>
          </div>
          <div className="bg-dark-800 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-gray-400 text-xs font-medium">主要群体</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.genderDist.sort((a,b) => b.count - a.count)[0]?.gender || '未知'}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={20} />
            </div>
          </div>
          <div className="bg-dark-800 border border-white/10 rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div>
              <p className="text-gray-400 text-xs font-medium">热门城市</p>
              <h3 className="text-2xl font-bold text-white mt-1">{stats.topCities[0]?.city || '未知'}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <MapPin size={20} />
            </div>
          </div>
        </div>

        {/* Charts Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Distributions */}
          <div className="space-y-6">
            <div className="bg-dark-800 border border-white/10 rounded-xl p-5 shadow-lg h-64">
              <h3 className="text-sm font-bold mb-4 text-gray-300">年龄分布</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ageDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="ageGroup" stroke="#888" tick={{fontSize: 10}} />
                    <YAxis stroke="#888" tick={{fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-xl p-5 shadow-lg h-64">
              <h3 className="text-sm font-bold mb-4 text-gray-300">性别比例</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.genderDist}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="gender"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.genderDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Col 2: Difficulty & Cities */}
          <div className="space-y-6">
            <div className="bg-dark-800 border border-white/10 rounded-xl p-5 shadow-lg h-64">
              <h3 className="text-sm font-bold mb-4 text-gray-300">难度等级分布</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.levelDist} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis type="number" stroke="#888" tick={{fontSize: 10}} />
                    <YAxis dataKey="name" type="category" stroke="#888" width={60} tick={{fontSize: 10}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="#82ca9d" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-dark-800 border border-white/10 rounded-xl p-5 shadow-lg h-64 overflow-y-auto custom-scrollbar">
              <h3 className="text-sm font-bold mb-4 text-gray-300">热门城市 Top 5</h3>
              <div className="space-y-3">
                {stats.topCities.map((city, index) => (
                  <div key={city.city} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-gray-400 text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1 text-xs">
                        <span className="font-medium text-gray-300">{city.city}</span>
                        <span className="text-gray-500">{city.count}人</span>
                      </div>
                      <div className="h-1.5 bg-dark-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(city.count / stats.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Col 3: Requirements Radar - Taller to fit */}
          <div className="bg-dark-800 border border-white/10 rounded-xl p-5 shadow-lg h-[536px]">
            <h3 className="text-sm font-bold mb-4 text-gray-300">形婚对象条件要求分布 (平均权重)</h3>
            <div className="h-[460px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={stats.requirementsDist || []}>
                  <PolarGrid stroke="#444" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
                  <Radar
                    name="平均要求"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Data Table */}
        <div className="bg-dark-800 border border-white/10 rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h3 className="text-lg font-bold">最新提交数据</h3>
            <button 
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
            >
              <Download size={16} /> 导出表格
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-dark-900 text-gray-200 uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">提交时间</th>
                  <th className="px-6 py-4">城市</th>
                  <th className="px-6 py-4">性别/年龄</th>
                  <th className="px-6 py-4">学历/职业</th>
                  <th className="px-6 py-4">收入</th>
                  <th className="px-6 py-4">难度评分</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {profiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">#{profile.id}</td>
                    <td className="px-6 py-4">{new Date(profile.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 text-white font-medium">{profile.city}</td>
                    <td className="px-6 py-4">{profile.gender} / {profile.age}岁</td>
                    <td className="px-6 py-4">{profile.education} {profile.occupation}</td>
                    <td className="px-6 py-4">{profile.income}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        profile.difficulty_level === '地狱模式' ? 'bg-red-500/20 text-red-400' :
                        profile.difficulty_level === '困难模式' ? 'bg-orange-500/20 text-orange-400' :
                        profile.difficulty_level === '普通模式' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {profile.difficulty_score} ({profile.difficulty_level})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

// Simple icons not imported above
function RefreshCcw({ size }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 2v6h6"></path>
      <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
      <path d="M21 22v-6h-6"></path>
      <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
    </svg>
  );
}

function MapPin({ size }) {
  return (
      <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  );
}

export default Admin;
