import React, { useState, useEffect } from 'react';
import { ChevronRight, RefreshCcw, UserPlus, Heart, Users, Home, DollarSign, Briefcase, GraduationCap, Smile, Activity, MapPin, Gift, FileText, Baby, Home as HomeIcon, MessageCircle, Clock, Lock, X, CheckCircle } from 'lucide-react';
import axios from 'axios';

// Dimensions configuration
const DIMENSIONS = [
  // Basic Info Group
  { id: 'age', label: '年龄匹配', icon: <Activity size={18} /> },
  { id: 'appearance', label: '外貌要求', icon: <Smile size={18} /> },
  { id: 'education', label: '学历背景', icon: <GraduationCap size={18} /> },
  { id: 'personality', label: '性格相投', icon: <Heart size={18} /> },
  { id: 'comingOut', label: '出柜情况', icon: <UserPlus size={18} /> }, // Using UserPlus as placeholder for coming out
  
  // Xinghun Specifics Group
  { id: 'income', label: '经济收入', icon: <DollarSign size={18} /> },
  { id: 'housing', label: '房产情况', icon: <Home size={18} /> },
  { id: 'car', label: '车辆代步', icon: <Briefcase size={18} /> }, 
  { id: 'wedding', label: '婚礼形式', icon: <Gift size={18} /> },
  { id: 'family', label: '家庭氛围', icon: <Users size={18} /> },
  { id: 'duration', label: '形婚长久度', icon: <Clock size={18} /> },
];

const InputField = ({ label, icon, children, isMissing = false, isFlashing = false }) => {
  const shouldShowFlash = isMissing && isFlashing;
  const shouldShowRequired = isMissing;
  
  return (
    <div className={`p-4 rounded-xl border backdrop-blur-sm space-y-2 transition-all duration-300 ${shouldShowFlash ? 'animate-pulse bg-red-900/30 border-red-500/50 shadow-[0_0_0_2px_rgba(239,68,68,0.3)]' : shouldShowRequired ? 'bg-dark-800/50 border-white/5' : 'bg-dark-800/50 border-white/5'}`}>
      <div className={`flex items-center gap-2 mb-1 ${shouldShowFlash ? 'text-red-300' : 'text-gray-300'}`}>
        <span className={shouldShowFlash ? 'text-red-400' : 'text-primary'}>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
        {shouldShowRequired && <span className="text-orange-400 text-xs ml-auto">*必填</span>}
      </div>
      {children}
    </div>
  );
};

const Select = ({ value, onChange, options, placeholder = "请选择", isMissing = false, fieldId, isFlashing = false }) => (
  <select 
    data-field-id={fieldId}
    value={value} 
    onChange={onChange}
    className={`w-full rounded-lg px-3 py-2 text-white focus:outline-none appearance-none transition-all duration-300 ${isMissing && isFlashing ? 'bg-red-900/20 border border-red-500/50 focus:border-red-400' : 'bg-dark-900 border border-white/10 focus:border-primary'}`}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map(opt => (
      <option key={opt} value={opt}>{opt}</option>
    ))}
  </select>
);

const Input = ({ value, onChange, placeholder, type = "text", isMissing = false, fieldId, isFlashing = false }) => (
  <input 
    data-field-id={fieldId}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`w-full rounded-lg px-3 py-2 text-white focus:outline-none transition-all duration-300 ${isMissing && isFlashing ? 'bg-red-900/20 border border-red-500/50 focus:border-red-400' : 'bg-dark-900 border border-white/10 focus:border-primary'}`}
  />
);

function HomePage() {
  const [step, setStep] = useState(0); // 0: Intro, 1: Profile, 2: Weights, 3: Calculating, 4: Result
  
  // Profile State with LocalStorage persistence
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('xinghun_profile');
    return saved ? JSON.parse(saved) : {
      gender: '',
      age: '',
      city: '',
      education: '',
      occupation: '',
      comingOut: '',
      personalitySelf: '',
      appearanceSelf: '',
      income: '',
      housingCar: '',
      gift: '',
      certificate: '',
      wedding: '',
      children: '',
      liveTogether: '',
      familyAtmosphere: '',
      cooperationFreq: '',
      duration: ''
    };
  });

  // Weights State with LocalStorage persistence
  const [weights, setWeights] = useState(() => {
    const saved = localStorage.getItem('xinghun_weights');
    const initialWeights = {};
    DIMENSIONS.forEach(d => initialWeights[d.id] = 50);
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge to ensure new dimensions have default values
        return { ...initialWeights, ...parsed };
      } catch (error) {
        return initialWeights;
      }
    }
    
    return initialWeights;
  });
  
  const [result, setResult] = useState(null);
  const [locating, setLocating] = useState(false);
  const [showMatchCard, setShowMatchCard] = useState(false);
  const [matchCardText, setMatchCardText] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [missingFields, setMissingFields] = useState([]);
  const [isFlashing, setIsFlashing] = useState(false);

  // Save to localStorage whenever profile changes
  useEffect(() => {
    localStorage.setItem('xinghun_profile', JSON.stringify(profile));
  }, [profile]);

  // Save to localStorage whenever weights change
  useEffect(() => {
    localStorage.setItem('xinghun_weights', JSON.stringify(weights));
  }, [weights]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set page title
  useEffect(() => {
    document.title = '形婚难度测算';
  }, []);

  const generateMatchCard = () => {
    const getAppearanceLabel = (label) => {
      if (label === '男神/女神') return '外貌出众';
      if (label === '普通') return '';
      return `外貌${label}`;
    };

    // 1. Basic Info Summary
    // Note: City is already shown in "📍 坐标", so we remove it from basicInfo to avoid duplication
    const basicInfo = [
      `${profile.age}岁`,
      `${profile.education}`,
      `${profile.occupation}`,
      `${profile.income}`,
      // profile.city,  <-- Removed to avoid duplication
      profile.housingCar === '无房无车' ? '' : profile.housingCar,
      getAppearanceLabel(profile.appearanceSelf),
      profile.personalitySelf === '内向社恐' ? '' : profile.personalitySelf,
    ].filter(Boolean).join(' / ');

    // 2. Requirements Highlight (Top 3 weights)
    const sortedWeights = Object.entries(weights)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([key]) => {
        const label = DIMENSIONS.find(d => d.id === key)?.label;
        // Rename specific labels for fluency
        if (label === '外貌要求') return '外貌';
        // Merge '车辆代步', '房车情况', '工作职业', '经济能力' into '经济情况'
        if (['经济能力', '房车情况', '工作职业', '车辆代步'].includes(label)) return '经济情况';
        return label;
      })
      .filter((value, index, self) => Boolean(value) && self.indexOf(value) === index); // Unique and non-empty
    
    const requirements = sortedWeights.length > 0 
      ? `希望能找到${sortedWeights.join('、')}比较匹配的队友。` 
      : '希望找到志同道合的队友。';

    // 3. Xinghun Specifics
    const specifics = [];
    if (profile.certificate) specifics.push(`领证意愿：${profile.certificate}`);
    if (profile.wedding && profile.wedding !== '不办') specifics.push(`婚礼计划：${profile.wedding}`);
    if (profile.children) specifics.push(profile.children.includes('要') ? '生育计划：想要孩子' : '生育计划：不打算要孩子');
    if (profile.liveTogether) specifics.push(profile.liveTogether === '同住' ? '居住方式：婚后希望同住' : '居住方式：婚后不同住');
    if (profile.dowry) specifics.push(`彩礼/嫁妆：${profile.dowry}`);

    const specificText = specifics.length > 0 ? `关于形婚形式，我的想法是：\n${specifics.join('；\n')}。` : '';

    // 4. Sincere Declaration
    const declarations = [
      "形婚不仅是形式，更是一份责任与契约。希望能遇到靠谱的你，像亲人一样相互扶持，共同应对社会的压力，给彼此一个温暖的避风港。",
      "在这个纷繁的世界里，寻找一位战友。不谈风月，只谈责任与尊重。愿我们能成为彼此最好的掩护，也是生活中值得信赖的朋友。",
      "真诚寻找形婚对象，非诚勿扰。我相信良好的沟通和明确的界限是长久合作的基础。期待与通情达理的你，共同开启人生的新篇章。",
      "虽是形婚，亦求真心相待（非爱情）。希望我们能像兄妹/姐弟一样相处，互敬互爱，孝顺父母，共同经营好这份特殊的亲情关系。"
    ];
    const randomDeclaration = declarations[Math.floor(Math.random() * declarations.length)];

    // Constructing the final text
    // Only show "Situation" section if comingOut is filled
    const situationSection = profile.comingOut ? `🌈 出柜情况：${profile.comingOut}` : '';
    
    // Determine Title based on gender/orientation
    let titleSuffix = '';
    if (profile.gender === '男') {
        titleSuffix = ' (G找L)';
    } else if (profile.gender === '女') {
        titleSuffix = ' (L找G)';
    }

    // Clean up sections to avoid empty lines if data is missing
    const sections = [
      `📍 坐标：${profile.city || '未填写'}`,
      `👤 个人：${profile.gender} / ${basicInfo}`,
      situationSection,
      '----------------',
      '💭 我的期待：',
      requirements,
      specificText,
      '\n🌟 个人优势：',
      `工作稳定，经济独立，${profile.familyAtmosphere === '开明自由' ? '家庭氛围开明' : '家庭关系简单'}，${profile.personalitySelf || '性格随和'}好相处。`,
      '\n🤝 形婚寄语：',
      randomDeclaration,
      '----------------',
      '(联系时请备注“形婚互助”)'
    ].filter(Boolean).join('\n');

    const cardText = `【形婚资料卡${titleSuffix}】\n----------------\n${sections}`;

    setMatchCardText(cardText);
    setShowMatchCard(true);
  };

  const copyToClipboard = () => {
    const successCallback = () => {
      setToastMessage('');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(matchCardText).then(successCallback).catch(() => fallbackCopy());
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = matchCardText;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setToastMessage('');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        showErrorToast('复制失败，请手动长按文本复制');
      }
    } catch (err) {
      showErrorToast('复制失败，请手动长按文本复制');
    }
    document.body.removeChild(textArea);
  };

  // 字段标签映射，用于友好提示
  const fieldLabels = {
    gender: '性别',
    age: '年龄',
    city: '所在城市',
    education: '学历',
    occupation: '职业',
    comingOut: '出柜情况',
    personalitySelf: '个人性格',
    appearanceSelf: '外貌自评',
    income: '经济收入',
    housingCar: '房/车情况',
    gift: '礼金情况',
    wedding: '婚礼情况',
    certificate: '是否扯证',
    children: '是否要小孩',
    liveTogether: '婚后同住',
    familyAtmosphere: '家庭氛围',
    cooperationFreq: '配合频次',
    duration: '形婚长久度'
  };

  const showErrorToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToField = (fieldId) => {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  const handleNextStep = () => {
    const missing = Object.entries(profile)
      .filter(([_, value]) => value === '' || value === null)
      .map(([key]) => key);

    if (missing.length === 0) {
      setMissingFields([]);
      setIsFlashing(false);
      setStep(2);
    } else {
      setMissingFields(missing);
      setIsFlashing(true);
      const firstMissing = missing[0];
      showErrorToast('请完成资料填写');
      
      setTimeout(() => {
        scrollToField(firstMissing);
      }, 300);
      
      setTimeout(() => {
        setIsFlashing(false);
      }, 2000);
    }
  };

  // 当用户修改某个字段时，清除该字段的高亮状态
  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    if (missingFields.includes(field)) {
      setMissingFields(prev => prev.filter(f => f !== field));
    }
  };

  const handleWeightChange = (id, value) => {
    setWeights(prev => ({ ...prev, [id]: parseInt(value) }));
  };

  const startCalculation = () => {
    setStep(3);
    
    setTimeout(async () => {
      const totalScore = Object.values(weights).reduce((a, b) => a + b, 0);
      const avgScore = totalScore / DIMENSIONS.length;
      
      // Base Difficulty
      let difficulty = Math.pow(avgScore, 1.3) / 4; 
      
      // --- Comprehensive Profile Adjustment Logic ---
      
      // 1. Gender & Orientation
      if (profile.gender === '男') difficulty += 2;
      
      // 2. Age
      const age = parseInt(profile.age) || 0;
      if (age > 32) difficulty += 5;       
      if (age < 24 && age > 0) difficulty += 2;

      // 3. City
      const tier1Cities = ['北京', '上海', '广州', '深圳', '杭州', '成都'];
      const isTier1 = tier1Cities.some(c => profile.city && profile.city.includes(c));
      if (isTier1) difficulty -= 5;
      else if (profile.city) difficulty += 2;

      // 4. Education
      if (profile.education === '大专及以下') difficulty += 3;
      if (profile.education === '博士') difficulty += 2;

      // 5. Income
      if (profile.income === '10w以下') difficulty += 3;
      if (profile.income === '50w-100w' || profile.income === '100w以上') difficulty -= 5;

      // 6. Housing/Car
      if (profile.housingCar === '有房有车') difficulty -= 5;
      if (profile.housingCar === '无房无车') difficulty += 5;

      // 7. Gift & Wedding
      if (profile.gift === '需重金') difficulty += 15;
      if (profile.gift === '不要礼金') difficulty -= 5;
      
      if (profile.wedding === '直婚规模') difficulty += 10; // Expensive and complex
      if (profile.wedding === '不办') difficulty -= 5;
      if (profile.wedding === '简单仪式') difficulty -= 2;

      // 8. Certificate
      if (profile.certificate === '领真证') difficulty += 8;
      if (profile.certificate === '不领证') difficulty -= 3;

      // 9. Children
      if (profile.children === '要(自然)') difficulty += 25;
      if (profile.children === '要(科学)') difficulty += 10;
      if (profile.children === '不要') difficulty -= 5;

      // 10. Live Together
      if (profile.liveTogether === '同住') difficulty += 10;
      if (profile.liveTogether === '不同住') difficulty -= 5;

      // 11. Family Atmosphere
      if (profile.familyAtmosphere === '复杂') difficulty += 5;
      if (profile.familyAtmosphere === '开明自由') difficulty -= 3;

      // 12. Cooperation Frequency
      if (profile.cooperationFreq === '经常互动') difficulty += 5;
      
      // 13. Appearance
      if (profile.appearanceSelf === '普通' && weights.appearance > 70) difficulty += 10;
      if (profile.appearanceSelf === '男神/女神') difficulty -= 5;

      // 14. Duration
      if (profile.duration === '长期维持') difficulty += 5;
      if (weights.duration > 80) difficulty += 10; // High expectation for duration
      
      // 15. Personality
      if (profile.personalitySelf === '内向社恐') difficulty += 3;
      if (profile.personalitySelf === '外向社牛') difficulty -= 2;

      // 16. Coming Out
      if (profile.comingOut === '已出柜') difficulty += 5; // Might be harder to find matching xinghun needs
      if (profile.comingOut === '形婚后出柜') difficulty += 3;

      // Clamp result
      difficulty = Math.min(99.9, Math.max(1.0, difficulty));
      
      const difficultyLevel = getDifficultyLevel(difficulty);
      const difficultyScore = difficulty.toFixed(1);

      // Submit data to backend
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        await axios.post(`${apiBase}/api/profiles`, {
          ...profile,
          difficultyScore,
          difficultyLevel,
          weights
        });
      } catch (error) {
        // Silently fail in production/demo environment where backend might not be available
        console.warn('Backend submission skipped or failed', error);
      }

      setResult({
        score: difficultyScore,
        level: difficultyLevel,
        summary: getSummary(difficulty)
      });
      setStep(4);
    }, 2000);
  };

  const getDifficultyLevel = (score) => {
    if (score < 20) return '简单模式';
    if (score < 50) return '普通模式';
    if (score < 80) return '困难模式';
    return '地狱模式';
  };

  const getSummary = (score) => {
    if (score < 20) return '你的条件优越且要求务实，在当前城市找到合适的形婚队友非常容易。';
    if (score < 50) return '你的情况属于主流水平，只要稍微花点心思，一定能遇到合适的人。';
    if (score < 80) return '你的要求较高或自身情况特殊，需要仔细筛选，建议扩大社交圈。';
    return '你的要求极高，简直是在寻找完美的艺术品。建议适当调整权重，或者做好长期寻找的准备。';
  };

  const DifficultyIndicator = ({ score }) => {
    const segments = [
      { label: '简单', min: 0, max: 20, color: 'bg-green-500', text: 'text-green-500' },
      { label: '普通', min: 20, max: 50, color: 'bg-blue-500', text: 'text-blue-500' },
      { label: '困难', min: 50, max: 80, color: 'bg-orange-500', text: 'text-orange-500' },
      { label: '地狱', min: 80, max: 100, color: 'bg-red-500', text: 'text-red-500' },
    ];
    
    return (
      <div className="w-full mt-8 px-4">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          {segments.map(s => (
            <span key={s.label} className={score >= s.min && score < s.max ? s.text + " font-bold scale-110 transition-transform" : ""}>{s.label}</span>
          ))}
        </div>
        <div className="h-2 w-full bg-gray-800 rounded-full flex overflow-hidden relative">
          {segments.map((s, i) => (
            <div key={i} className={`h-full ${s.color} opacity-30`} style={{ width: `${s.max - s.min}%` }} />
          ))}
          <div 
            className="absolute h-4 w-4 bg-white rounded-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 shadow-[0_0_10px_white] transition-all duration-1000 ease-out"
            style={{ left: `${score}%` }}
          />
        </div>
      </div>
    );
  };

  const getWeightLabel = (value) => {
    if (value <= 30) return <span className="text-green-400">低要求 ({value}%)</span>;
    if (value <= 70) return <span className="text-yellow-400">适中要求 ({value}%)</span>;
    return <span className="text-red-400">高要求 ({value}%)</span>;
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 font-sans selection:bg-primary selection:text-white pb-10 w-full max-w-md mx-auto relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="bg-animate-particle w-64 h-64 top-10 left-10 opacity-20"></div>
        <div className="bg-animate-particle w-96 h-96 bottom-20 right-10 animation-delay-2000 opacity-20" style={{ animationDelay: '2s', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)' }}></div>
      </div>
      
      <div className="relative z-10 px-6 pt-12">
        {step === 0 && (
          <div className="flex flex-col items-center justify-center h-[80vh] space-y-8 animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <Activity className="text-white w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-center">
              形婚难度<br/>AI测算
            </h1>
            <p className="text-gray-400 text-center max-w-xs leading-relaxed">
              输入个人资料与需求权重，<br/>AI算法将为你解析当前城市的<br/>匹配难度系数。
            </p>
            <button 
              onClick={() => setStep(1)}
              className="mt-8 px-8 py-4 bg-white text-dark-900 rounded-full font-bold text-lg hover:bg-gray-200 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
            >
              开始测算 <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6 animate-fade-in pb-24">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">完善个人资料</h2>
              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-primary bg-primary/10 py-2 px-4 rounded-full mx-auto w-fit">
                <Lock size={12} />
                <span>仅用于AI测算，不保存任何隐私信息，请放心填写</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Group 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1 border-l-2 border-primary">基础信息</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="性别" icon={<UserPlus size={16} />} isMissing={missingFields.includes('gender')} isFlashing={isFlashing}>
                     <Select 
                      fieldId="gender"
                      isMissing={missingFields.includes('gender')}
                      isFlashing={isFlashing}
                      value={profile.gender} 
                      onChange={(e) => handleProfileChange('gender', e.target.value)}
                      options={['男', '女']} 
                    />
                  </InputField>
                  <InputField label="年龄" icon={<Activity size={16} />} isMissing={missingFields.includes('age')} isFlashing={isFlashing}>
                    <Input 
                      fieldId="age"
                      isMissing={missingFields.includes('age')}
                      isFlashing={isFlashing}
                      type="number" 
                      value={profile.age}
                      onChange={(e) => handleProfileChange('age', e.target.value)}
                      placeholder="请输入"
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="外貌自评" icon={<Smile size={16} />} isMissing={missingFields.includes('appearanceSelf')} isFlashing={isFlashing}>
                     <Select 
                      fieldId="appearanceSelf"
                      isMissing={missingFields.includes('appearanceSelf')}
                      isFlashing={isFlashing}
                      value={profile.appearanceSelf} 
                      onChange={(e) => handleProfileChange('appearanceSelf', e.target.value)}
                      options={['普通', '中上', '优秀', '男神/女神']} 
                    />
                  </InputField>
                  <InputField label="所在城市" icon={<MapPin size={16} />} isMissing={missingFields.includes('city')} isFlashing={isFlashing}>
                    <Input 
                      fieldId="city"
                      isMissing={missingFields.includes('city')}
                      isFlashing={isFlashing}
                      type="text" 
                      value={profile.city}
                      onChange={(e) => handleProfileChange('city', e.target.value)}
                      placeholder="请输入（如：厦门市）"
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="学历" icon={<GraduationCap size={16} />} isMissing={missingFields.includes('education')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="education"
                      isMissing={missingFields.includes('education')}
                      isFlashing={isFlashing}
                      value={profile.education} 
                      onChange={(e) => handleProfileChange('education', e.target.value)}
                      options={['大专及以下', '本科', '硕士', '博士']} 
                    />
                  </InputField>
                  <InputField label="职业" icon={<Briefcase size={16} />} isMissing={missingFields.includes('occupation')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="occupation"
                      isMissing={missingFields.includes('occupation')}
                      isFlashing={isFlashing}
                      value={profile.occupation} 
                      onChange={(e) => handleProfileChange('occupation', e.target.value)}
                      options={['体制内', '国企', '私企', '外企', '创业', '自由职业', '待业/学生']} 
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="出柜情况" icon={<UserPlus size={16} />} isMissing={missingFields.includes('comingOut')} isFlashing={isFlashing}>
                     <Select 
                      fieldId="comingOut"
                      isMissing={missingFields.includes('comingOut')}
                      isFlashing={isFlashing}
                      value={profile.comingOut} 
                      onChange={(e) => handleProfileChange('comingOut', e.target.value)}
                      options={['未出柜', '半出柜', '已出柜', '形婚后出柜']} 
                    />
                  </InputField>

                  <InputField label="个人性格" icon={<Smile size={16} />} isMissing={missingFields.includes('personalitySelf')} isFlashing={isFlashing}>
                     <Select 
                      fieldId="personalitySelf"
                      isMissing={missingFields.includes('personalitySelf')}
                      isFlashing={isFlashing}
                      value={profile.personalitySelf} 
                      onChange={(e) => handleProfileChange('personalitySelf', e.target.value)}
                      options={['内向社恐', '温和随性', '开朗健谈', '外向社牛', '独立强势']} 
                    />
                  </InputField>
                </div>


              </div>

              {/* Group 2: Xinghun Specifics */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider pl-1 border-l-2 border-primary">形婚相关</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="经济收入" icon={<DollarSign size={16} />} isMissing={missingFields.includes('income')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="income"
                      isMissing={missingFields.includes('income')}
                      isFlashing={isFlashing}
                      value={profile.income} 
                      onChange={(e) => handleProfileChange('income', e.target.value)}
                      options={['10w以下', '10w-20w', '20w-50w', '50w-100w', '100w以上']} 
                    />
                  </InputField>
                  <InputField label="房/车情况" icon={<Home size={16} />} isMissing={missingFields.includes('housingCar')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="housingCar"
                      isMissing={missingFields.includes('housingCar')}
                      isFlashing={isFlashing}
                      value={profile.housingCar} 
                      onChange={(e) => handleProfileChange('housingCar', e.target.value)}
                      options={['有房有车', '有房无车', '有车无房', '无房无车']} 
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <InputField label="礼金情况" icon={<Gift size={16} />} isMissing={missingFields.includes('gift')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="gift"
                      isMissing={missingFields.includes('gift')}
                      isFlashing={isFlashing}
                      value={profile.gift} 
                      onChange={(e) => handleProfileChange('gift', e.target.value)}
                      options={['不要礼金', '意思一下', '随大流', '需重金']} 
                    />
                  </InputField>
                   <InputField label="婚礼情况" icon={<Gift size={16} />} isMissing={missingFields.includes('wedding')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="wedding"
                      isMissing={missingFields.includes('wedding')}
                      isFlashing={isFlashing}
                      value={profile.wedding} 
                      onChange={(e) => handleProfileChange('wedding', e.target.value)}
                      options={['不办', '简单仪式', '商量着来', '直婚规模']} 
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <InputField label="是否扯证" icon={<FileText size={16} />} isMissing={missingFields.includes('certificate')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="certificate"
                      isMissing={missingFields.includes('certificate')}
                      isFlashing={isFlashing}
                      value={profile.certificate} 
                      onChange={(e) => handleProfileChange('certificate', e.target.value)}
                      options={['领真证', '不领证', '商量着来']} 
                    />
                  </InputField>
                   <InputField label="是否要小孩" icon={<Baby size={16} />} isMissing={missingFields.includes('children')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="children"
                      isMissing={missingFields.includes('children')}
                      isFlashing={isFlashing}
                      value={profile.children} 
                      onChange={(e) => handleProfileChange('children', e.target.value)}
                      options={['不要', '要(科学)', '要(自然)', '商量着来']} 
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <InputField label="婚后同住" icon={<HomeIcon size={16} />} isMissing={missingFields.includes('liveTogether')} isFlashing={isFlashing}>
                    <Select 
                      fieldId="liveTogether"
                      isMissing={missingFields.includes('liveTogether')}
                      isFlashing={isFlashing}
                      value={profile.liveTogether} 
                      onChange={(e) => handleProfileChange('liveTogether', e.target.value)}
                      options={['不同住', '同住', '偶尔同住']} 
                    />
                  </InputField>
                  <InputField label="家庭氛围" icon={<Users size={16} />} isMissing={missingFields.includes('familyAtmosphere')} isFlashing={isFlashing}>
                     <Select 
                      fieldId="familyAtmosphere"
                      isMissing={missingFields.includes('familyAtmosphere')}
                      isFlashing={isFlashing}
                      value={profile.familyAtmosphere} 
                      onChange={(e) => handleProfileChange('familyAtmosphere', e.target.value)}
                      options={['开明自由', '传统保守', '一般家庭', '复杂']} 
                    />
                  </InputField>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField label="配合频次" icon={<MessageCircle size={16} />} isMissing={missingFields.includes('cooperationFreq')} isFlashing={isFlashing}>
                     <Select 
                      fieldId="cooperationFreq"
                      isMissing={missingFields.includes('cooperationFreq')}
                      isFlashing={isFlashing}
                      value={profile.cooperationFreq} 
                      onChange={(e) => handleProfileChange('cooperationFreq', e.target.value)}
                      options={['仅节假日', '偶尔聚会', '经常互动', '几乎不往来']} 
                    />
                  </InputField>
                  <InputField label="形婚长久度" icon={<Clock size={16} />} isMissing={missingFields.includes('duration')} isFlashing={isFlashing}>
                     <Select 
                      fieldId="duration"
                      isMissing={missingFields.includes('duration')}
                      isFlashing={isFlashing}
                      value={profile.duration} 
                      onChange={(e) => handleProfileChange('duration', e.target.value)}
                      options={['1-3年', '3-5年', '5-10年', '长期维持']} 
                    />
                  </InputField>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNextStep}
              className="fixed bottom-6 left-6 right-6 mx-auto max-w-sm bg-gradient-to-r from-primary to-accent text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all z-50"
            >
              下一步：设定需求
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in pb-24">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">设定形婚对象要求</h2>
              <p className="text-sm text-gray-500 mt-2">拖动滑块设定您对另一半的各项要求 (0-100)</p>
            </div>
            
            <div className="space-y-5">
              {DIMENSIONS.map((dim) => (
                <div key={dim.id} className="bg-dark-800/50 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      <span className="text-primary">{dim.icon}</span>
                      <span className="font-medium">{dim.label}</span>
                    </div>
                    <span className="text-primary font-mono font-bold text-sm">{getWeightLabel(weights[dim.id])}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weights[dim.id]}
                    onChange={(e) => handleWeightChange(dim.id, e.target.value)}
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="fixed bottom-6 left-6 right-6 mx-auto max-w-sm flex gap-3 z-50">
               <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-dark-800 text-gray-300 py-4 rounded-full font-bold text-lg shadow-lg border border-white/10"
              >
                上一步
              </button>
              <button 
                onClick={startCalculation}
                className="flex-[2] bg-gradient-to-r from-primary to-accent text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
              >
                生成报告
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 animate-pulse">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-4 border-dark-700 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">AI</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-medium">正在分析匹配数据...</h3>
              <p className="text-gray-500 text-sm">综合分析您的个人画像与需求</p>
            </div>
          </div>
        )}

        {step === 4 && result && (
          <div className="animate-fade-in space-y-8 pb-10">
            <div className="text-center space-y-2">
              <p className="text-gray-400 text-sm uppercase tracking-widest">Finding Partner</p>
              <h2 className="text-3xl font-bold">难度系数报告</h2>
            </div>

            <div className="bg-gradient-to-b from-dark-800 to-dark-900 rounded-2xl p-8 border border-white/10 relative overflow-hidden text-center shadow-2xl min-h-[65vh] flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>
              
              <div className="mb-2 text-gray-400">当前城市匹配难度</div>
              <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 font-mono tracking-tighter">
                {result.score}
              </div>
              
              <div className={`inline-block px-4 py-1 rounded-full text-sm font-bold mt-4 ${
                result.level === '地狱模式' ? 'bg-red-500/20 text-red-400' : 
                result.level === '困难模式' ? 'bg-orange-500/20 text-orange-400' :
                result.level === '普通模式' ? 'bg-blue-500/20 text-blue-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {result.level}
              </div>

              <DifficultyIndicator score={parseFloat(result.score)} />

              <div className="mt-8 text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-6">
                {result.summary}
              </div>

              <button 
                onClick={generateMatchCard}
                className="w-full mt-4 py-3 bg-gradient-to-r from-primary/80 to-accent/80 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                <FileText size={16} /> 生成形婚资料卡
              </button>

              <button 
                onClick={() => { setStep(0); }}
                className="w-full mt-3 py-3 text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm border border-white/5 rounded-lg hover:bg-white/5"
              >
                <RefreshCcw size={14} /> 重新测算
              </button>
            </div>

            {/* Match Card Modal */}
            {showMatchCard && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="bg-dark-800 rounded-2xl max-w-sm w-full border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
                    <h3 className="font-bold text-lg">形婚资料预览</h3>
                    <button 
                      onClick={() => setShowMatchCard(false)} 
                      className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="p-4 bg-dark-900/50 overflow-y-auto custom-scrollbar">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-300 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                      {matchCardText}
                    </pre>
                  </div>
                  <div className="p-4 flex gap-3 shrink-0 border-t border-white/10 bg-dark-800">
                    <button 
                      onClick={() => setShowMatchCard(false)}
                      className="flex-1 py-3 text-gray-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      关闭
                    </button>
                    <button 
                      onClick={copyToClipboard}
                      className="flex-[2] py-3 text-white rounded-lg font-bold shadow-lg transition-all duration-300 bg-primary shadow-primary/20 hover:bg-primary/90"
                    >
                      一键复制资料
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Toast Notification */}
            {showToast && (
              <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in-down border transition-all duration-300 ${toastMessage.includes('请先填写') ? 'bg-red-900/90 border-red-500/50' : 'bg-black/80 border-white/10'}`}>
                {toastMessage.includes('请先填写') ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                ) : (
                  <CheckCircle size={18} className="text-green-400" />
                )}
                <span className="font-medium text-sm">{toastMessage || '已复制'}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
                <div className="h-px bg-gray-800 flex-1"></div>
                <span>解决方案</span>
                <div className="h-px bg-gray-800 flex-1"></div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col items-center text-center space-y-4">
                <div className="bg-green-500/10 p-3 rounded-full text-green-400">
                  <Users size={32} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">加入本地形婚互助群</h3>
                  <p className="text-sm text-gray-400 mt-1">汇聚高质量队友，免费入群交流</p>
                </div>
                
                <div className="bg-white p-2 rounded-lg mt-2">
                  <img src="/qrcode.jpg" alt="群主微信二维码" className="w-32 h-32 object-cover" />
                </div>
                
                <p className="text-xs text-gray-500 mt-2">长按识别加好友，备注“城市”通过</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
