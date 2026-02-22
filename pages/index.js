import { useState, useEffect } from 'react';
import { DIMENSIONS } from '../lib/dimensions';

const s = {
  tag: { display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:600 },
  input: { width:'100%', padding:'12px 16px', borderRadius:12, border:'2px solid #E5E5E5', fontSize:14, fontFamily:'inherit', outline:'none', background:'white', transition:'border 0.2s' },
};

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position:'fixed', bottom:30, left:'50%', transform:'translateX(-50%)', padding:'12px 24px', borderRadius:20, fontSize:13, fontWeight:600, zIndex:999, boxShadow:'0 4px 20px rgba(0,0,0,0.15)', background: toast.type==='error'?'#FEE2E2':'#1A1A1A', color: toast.type==='error'?'#EF4444':'white' }}>
      {toast.msg}
    </div>
  );
}

export default function Home() {
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [view, setView] = useState('library');
  const [filters, setFilters] = useState({ purpose: [], hook: [], structure: [] });
  const [newCopy, setNewCopy] = useState({ title: '', content: '', platform: '', addedBy: '' });
  const [selectedCopy, setSelectedCopy] = useState(null);
  const [activeFilterDim, setActiveFilterDim] = useState('purpose');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCopies = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/copies');
      setCopies(await res.json());
    } catch { showToast('加载失败', 'error'); }
    setLoading(false);
  };

  useEffect(() => { loadCopies(); }, []);

  const handleAdd = async () => {
    if (!newCopy.title.trim() || !newCopy.content.trim()) { showToast('请填写标题和文案内容', 'error'); return; }
    setAnalyzing(true);
    try {
      // Analyze
      const aRes = await fetch('/api/analyze', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ content: newCopy.content }) });
const aText = await aRes.text();
if (!aRes.ok) { showToast(`AI分析失败: ${aText}`, 'error'); setAnalyzing(false); return; }
let analysis = {};
try { analysis = JSON.parse(aText); } catch(e) { showToast(`解析失败: ${aText.slice(0,100)}`, 'error'); setAnalyzing(false); return; }
      if (!aRes.ok) { showToast(`AI分析失败: ${analysis.error}`, 'error'); setAnalyzing(false); return; }

      // Save
      const entry = { ...newCopy, ...analysis, addedAt: new Date().toLocaleDateString('zh-CN') };
      const sRes = await fetch('/api/copies', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(entry) });
      const saved = await sRes.json();
      setCopies(prev => [saved, ...prev]);
      setNewCopy({ title:'', content:'', platform:'', addedBy:'' });
      setView('library');
      showToast('文案已添加并自动分析完成 ✨');
    } catch(e) { showToast(`错误: ${e.message}`, 'error'); }
    setAnalyzing(false);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/copies?id=${id}`, { method:'DELETE' });
    setCopies(prev => prev.filter(c => c.id !== id));
    setSelectedCopy(null);
    setView('library');
    showToast('已删除');
  };

  const toggleFilter = (dim, val) => {
    setFilters(prev => ({ ...prev, [dim]: prev[dim].includes(val) ? prev[dim].filter(x=>x!==val) : [...prev[dim], val] }));
  };

  const filteredCopies = copies.filter(c => {
    const s = !searchTerm || c.title?.includes(searchTerm) || c.content?.includes(searchTerm);
    const p = filters.purpose.length===0 || filters.purpose.some(f => c.purpose?.includes(f));
    const h = filters.hook.length===0 || filters.hook.some(f => c.hook?.includes(f));
    const st = filters.structure.length===0 || filters.structure.some(f => c.structure?.includes(f));
    return s && p && h && st;
  });

  const activeFilterCount = filters.purpose.length + filters.hook.length + filters.structure.length;

  return (
    <div style={{ minHeight:'100vh', background:'#F7F6F3' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap');
        .card { background:white; border-radius:16px; padding:20px; box-shadow:0 1px 4px rgba(0,0,0,0.06); transition:all 0.2s; cursor:pointer; border:2px solid transparent; }
        .card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.1); transform:translateY(-2px); }
        .btn { padding:10px 20px; border-radius:10px; border:none; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; font-family:inherit; }
        .btn-primary { background:#1A1A1A; color:white; }
        .btn-primary:hover { background:#333; }
        .inp:focus { border-color:#7C3AED !important; }
        textarea { resize:vertical; }
      `}</style>

      {/* Nav */}
      <div style={{ background:'white', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid #F0F0F0', position:'sticky', top:0, zIndex:50 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900 }}>📝 爆款文案库</div>
          <div style={{ fontSize:11, color:'#999', marginTop:1 }}>团队共享 · AI 智能分析</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn" onClick={()=>setView('library')} style={{ background: view==='library'?'#1A1A1A':'transparent', color: view==='library'?'white':'#888', border:'none' }}>📚 文案库</button>
          <button className="btn" onClick={()=>setView('add')} style={{ background:'#7C3AED', color:'white' }}>+ 添加文案</button>
        </div>
      </div>

      {/* Library */}
      {view === 'library' && (
        <div style={{ display:'flex', maxWidth:1100, margin:'0 auto', gap:20, padding:20 }}>
          {/* Sidebar */}
          <div style={{ width:240, flexShrink:0 }}>
            <div style={{ background:'white', borderRadius:16, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontWeight:700, fontSize:14 }}>筛选维度</span>
                {activeFilterCount > 0 && <button onClick={()=>setFilters({purpose:[],hook:[],structure:[]})} style={{ fontSize:11, color:'#7C3AED', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>清除({activeFilterCount})</button>}
              </div>
              <div style={{ display:'flex', gap:4, marginBottom:14, background:'#F5F5F5', borderRadius:10, padding:4 }}>
                {Object.entries(DIMENSIONS).map(([key, dim]) => (
                  <button key={key} onClick={()=>setActiveFilterDim(key)} style={{ flex:1, padding:'6px 4px', borderRadius:7, border:'none', cursor:'pointer', fontSize:13, fontFamily:'inherit', background: activeFilterDim===key?'white':'transparent', color: activeFilterDim===key?dim.color:'#999', boxShadow: activeFilterDim===key?'0 1px 4px rgba(0,0,0,0.1)':'none', transition:'all 0.2s' }}>
                    {dim.icon}
                  </button>
                ))}
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:DIMENSIONS[activeFilterDim].color, marginBottom:10 }}>{DIMENSIONS[activeFilterDim].label}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {DIMENSIONS[activeFilterDim].options.map(opt => {
                  const active = filters[activeFilterDim].includes(opt);
                  const dim = DIMENSIONS[activeFilterDim];
                  return (
                    <button key={opt} onClick={()=>toggleFilter(activeFilterDim, opt)} style={{ padding:'8px 12px', borderRadius:10, border:`2px solid ${active?dim.color:'#EBEBEB'}`, background: active?dim.bg:'transparent', color: active?dim.color:'#666', fontSize:12, fontWeight: active?700:500, cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all 0.15s' }}>
                      {active?'✓ ':''}{opt}
                      <div style={{ fontSize:10, color:'#AAA', fontWeight:400, marginTop:2, lineHeight:1.3 }}>{dim.definitions[opt]?.slice(0,18)}...</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main */}
          <div style={{ flex:1 }}>
            <input className="inp" style={{ ...s.input, marginBottom:16 }} placeholder="🔍 搜索文案标题或内容..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            {activeFilterCount > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                {Object.entries(filters).map(([dim, vals]) => vals.map(v => (
                  <span key={`${dim}-${v}`} style={{ ...s.tag, background:DIMENSIONS[dim].bg, color:DIMENSIONS[dim].color, cursor:'pointer' }} onClick={()=>toggleFilter(dim,v)}>
                    {DIMENSIONS[dim].icon} {v} ×
                  </span>
                )))}
              </div>
            )}
            <div style={{ fontSize:12, color:'#999', marginBottom:14 }}>共 <strong style={{color:'#1A1A1A'}}>{filteredCopies.length}</strong> 条文案{activeFilterCount>0?'（已筛选）':''}</div>
            {loading ? (
              <div style={{ textAlign:'center', padding:60, color:'#999' }}>加载中...</div>
            ) : filteredCopies.length===0 ? (
              <div style={{ textAlign:'center', padding:60 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <div style={{ color:'#999', fontSize:14 }}>暂无文案，点击「添加文案」开始积累</div>
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {filteredCopies.map(c => (
                  <div key={c.id} className="card" onClick={()=>{setSelectedCopy(c);setView('detail');}}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                      <div style={{ fontWeight:700, fontSize:14, lineHeight:1.4, flex:1, marginRight:8 }}>{c.title}</div>
                      {c.platform && <span style={{ fontSize:10, background:'#F5F5F5', color:'#888', padding:'3px 8px', borderRadius:8, flexShrink:0 }}>{c.platform}</span>}
                    </div>
                    <div style={{ fontSize:12, color:'#666', marginBottom:12, lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{c.content}</div>
                    {c.summary && <div style={{ fontSize:11, background:'#FFFBEB', color:'#B45309', padding:'4px 10px', borderRadius:8, marginBottom:10, fontWeight:600 }}>💡 {c.summary}</div>}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                      {c.purpose?.map(t=><span key={t} style={{ ...s.tag, background:DIMENSIONS.purpose.bg, color:DIMENSIONS.purpose.color }}>{DIMENSIONS.purpose.icon} {t}</span>)}
                      {c.hook?.map(t=><span key={t} style={{ ...s.tag, background:DIMENSIONS.hook.bg, color:DIMENSIONS.hook.color }}>{DIMENSIONS.hook.icon} {t}</span>)}
                    </div>
                    <div style={{ marginTop:10, fontSize:11, color:'#BBB', display:'flex', justifyContent:'space-between' }}>
                      <span>由 {c.addedBy||'团队成员'} 添加</span><span>{c.addedAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add */}
      {view === 'add' && (
        <div style={{ maxWidth:640, margin:'0 auto', padding:20 }}>
          <button onClick={()=>setView('library')} style={{ background:'none', border:'none', cursor:'pointer', color:'#666', fontSize:14, marginBottom:20 }}>← 返回</button>
          <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight:900, fontSize:20, marginBottom:4 }}>添加爆款文案</div>
            <div style={{ fontSize:13, color:'#999', marginBottom:24 }}>粘贴文案后，AI 将自动分析分类维度</div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, marginBottom:6, display:'block', color:'#555' }}>文案标题 *</label>
              <input className="inp" style={s.input} placeholder="简短描述这条文案" value={newCopy.title} onChange={e=>setNewCopy(p=>({...p,title:e.target.value}))} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, marginBottom:6, display:'block', color:'#555' }}>文案内容 *</label>
              <textarea className="inp" style={{ ...s.input, minHeight:180 }} placeholder="粘贴完整文案内容..." value={newCopy.content} onChange={e=>setNewCopy(p=>({...p,content:e.target.value}))} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, marginBottom:6, display:'block', color:'#555' }}>添加人</label>
              <input className="inp" style={s.input} placeholder="你的名字" value={newCopy.addedBy} onChange={e=>setNewCopy(p=>({...p,addedBy:e.target.value}))} />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:13, fontWeight:600, marginBottom:6, display:'block', color:'#555' }}>投放平台（选填）</label>
              <input className="inp" style={s.input} placeholder="例：抖音 / 小红书 / 视频号" value={newCopy.platform} onChange={e=>setNewCopy(p=>({...p,platform:e.target.value}))} />
            </div>
            <button className="btn btn-primary" onClick={handleAdd} disabled={analyzing} style={{ width:'100%', padding:14, fontSize:15, borderRadius:14, opacity:analyzing?0.7:1 }}>
              {analyzing ? '🤖 AI 分析中...' : '✨ 自动分析并保存'}
            </button>
            {analyzing && <div style={{ marginTop:14, padding:14, background:'#F5F0FF', borderRadius:12, fontSize:13, color:'#7C3AED', textAlign:'center', fontWeight:600 }}>正在分析内容目的、开头钩子、功能结构...</div>}
          </div>
        </div>
      )}

      {/* Detail */}
      {view === 'detail' && selectedCopy && (
        <div style={{ maxWidth:720, margin:'0 auto', padding:20 }}>
          <button onClick={()=>setView('library')} style={{ background:'none', border:'none', cursor:'pointer', color:'#666', fontSize:14, marginBottom:20 }}>← 返回文案库</button>
          <div style={{ background:'white', borderRadius:20, padding:28, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
              <div style={{ fontWeight:900, fontSize:20 }}>{selectedCopy.title}</div>
              {selectedCopy.platform && <span style={{ fontSize:12, background:'#F5F5F5', color:'#888', padding:'4px 12px', borderRadius:10 }}>{selectedCopy.platform}</span>}
            </div>
            <div style={{ fontSize:12, color:'#BBB', marginBottom:20 }}>由 {selectedCopy.addedBy||'团队成员'} 添加于 {selectedCopy.addedAt}</div>
            {selectedCopy.summary && (
              <div style={{ background:'#FFFBEB', border:'2px solid #FCD34D', borderRadius:12, padding:14, marginBottom:20 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#B45309', marginBottom:4 }}>AI 策略总结</div>
                <div style={{ fontSize:14, fontWeight:600, color:'#92400E' }}>💡 {selectedCopy.summary}</div>
              </div>
            )}
            <div style={{ background:'#FAFAFA', borderRadius:14, padding:18, marginBottom:24, lineHeight:1.8, fontSize:14, color:'#333', whiteSpace:'pre-wrap' }}>{selectedCopy.content}</div>
            {Object.entries(DIMENSIONS).map(([key, dim]) => {
              const tags = selectedCopy[key] || [];
              if (!tags.length) return null;
              return (
                <div key={key} style={{ marginBottom:18 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#888', marginBottom:8 }}>{dim.icon} {dim.label}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {tags.map(t => (
                      <div key={t} style={{ background:dim.bg, borderRadius:12, padding:'8px 14px', border:`2px solid ${dim.color}20` }}>
                        <div style={{ fontSize:13, fontWeight:700, color:dim.color }}>{t}</div>
                        <div style={{ fontSize:11, color:'#888', marginTop:2 }}>{dim.definitions[t]||''}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            <button onClick={()=>handleDelete(selectedCopy.id)} style={{ marginTop:24, width:'100%', padding:12, borderRadius:12, border:'2px solid #FEE2E2', background:'transparent', color:'#EF4444', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              🗑️ 删除这条文案
            </button>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
