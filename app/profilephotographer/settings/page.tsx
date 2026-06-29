"use client";

import { useRef, useState } from "react";

/* ─────────────── Constants ─────────────── */
const EQUIPMENT_OPTS = ["Sony A7R IV","Canon 5D Mark IV","24-70mm f/2.8 GM","50mm f/1.2","85mm f/1.4","Đèn studio","Flycam","Gimbal","Profoto B10"];
const LANG_OPTS      = ["Tiếng Việt (bản địa)","Tiếng Anh (lưu loát)","Tiếng Nhật (cơ bản)","Tiếng Hàn (cơ bản)","Tiếng Pháp (cơ bản)"];
const STYLE_OPTS     = ["Tự nhiên","Vintage","Hiện đại","Fine Art","Editorial","Lifestyle","Documentary","Dark & Moody"];
const UNIT_OPTS      = ["buổi","ngày","giờ","gói","sản phẩm"];
const SVC_CATS = [
  { id:"wedding",    label:"Cưới hỏi",        color:"bg-pink-50 border-pink-200 text-pink-700" },
  { id:"portrait",   label:"Chân dung",        color:"bg-blue-50 border-blue-200 text-blue-700" },
  { id:"couple",     label:"Cặp đôi",          color:"bg-rose-50 border-rose-200 text-rose-700" },
  { id:"event",      label:"Sự kiện",          color:"bg-purple-50 border-purple-200 text-purple-700" },
  { id:"yearbook",   label:"Kỷ yếu",           color:"bg-green-50 border-green-200 text-green-700" },
  { id:"food",       label:"Food & Product",   color:"bg-orange-50 border-orange-200 text-orange-700" },
  { id:"travel",     label:"Travel",           color:"bg-sky-50 border-sky-200 text-sky-700" },
  { id:"commercial", label:"Thương mại",       color:"bg-slate-50 border-slate-300 text-slate-700" },
];

/* ─────────────── Types ─────────────── */
type Pkg = { id: string; category: string; name: string; price: string; unit: string; desc: string; active: boolean };
type Portfolio = { id: string; url: string; cover: boolean };

/* ─────────────── Tiny components ─────────────── */
function TInput({ value, onChange, placeholder, type="text", rows }: {
  value: string; onChange:(v:string)=>void; placeholder?:string; type?:string; rows?:number;
}) {
  const cls = "w-full rounded-2xl border border-slate-200 bg-[#f8f9fb] px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 placeholder:text-slate-300";
  if (rows) return (
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      className={cls + " resize-none"} />
  );
  return <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function Toggle({ on, onToggle }:{ on:boolean; onToggle:()=>void }) {
  return (
    <button type="button" onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors ${on?"bg-orange-500":"bg-slate-200"}`}>
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on?"left-[22px]":"left-0.5"}`}/>
    </button>
  );
}

function TagPicker({ items, opts, onAdd, onRemove, placeholder }:{
  items:string[]; opts:string[]; onAdd:(v:string)=>void; onRemove:(v:string)=>void; placeholder?:string;
}) {
  const [open,setOpen]=useState(false);
  const remaining=opts.filter(o=>!items.includes(o));
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-[#f8f9fb] p-2.5 min-h-[44px]">
        {items.map(item=>(
          <span key={item} className="inline-flex items-center gap-1 rounded-lg bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
            {item}
            <button onClick={()=>onRemove(item)} className="ml-0.5 text-orange-400 hover:text-orange-700 leading-none">×</button>
          </span>
        ))}
        {remaining.length>0&&(
          <div className="relative">
            <button onClick={()=>setOpen(!open)}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-400 hover:border-orange-400 hover:text-orange-500">
              + {placeholder??"Thêm"}
            </button>
            {open&&(
              <div className="absolute top-8 left-0 z-20 min-w-[180px] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                {remaining.map(opt=>(
                  <button key={opt} onClick={()=>{onAdd(opt);setOpen(false);}}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs text-slate-600 hover:bg-orange-50 hover:text-orange-600">
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, subtitle, right, children }:{
  icon:string; title:string; subtitle?:string; right?:React.ReactNode; children:React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-50 text-lg">{icon}</span>
          <div>
            <h2 className="text-[15px] font-bold text-slate-800">{title}</h2>
            {subtitle&&<p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

/* ─────────────── Main page ─────────────── */
export default function PhotographerSettingsPage() {
  /* Basic info */
  const [avatar, setAvatar]           = useState<string|null>(null);
  const [name, setName]               = useState("Markus Andersen");
  const [title, setTitle]             = useState("Nhiếp ảnh gia Thương mại & Kiến trúc");
  const [bio, setBio]                 = useState("Với hơn 10 năm kinh nghiệm trong lĩnh vực nhiếp ảnh thương mại, tôi tập trung vào việc kiến tạo những khung hình có chiều sâu, tôn vinh ánh sáng tự nhiên và đường nét kiến trúc. Từng cộng tác với nhiều tạp chí thiết kế uy tín.");
  const [email, setEmail]             = useState("markus@studion.vn");
  const [phone, setPhone]             = useState("0909 123 456");
  const [website, setWebsite]         = useState("");
  const [location, setLocation]       = useState("TP. Hồ Chí Minh, Việt Nam");
  const [available, setAvailable]     = useState("Sẵn sàng đi công tác xa");
  const [isActive, setIsActive]       = useState(true);

  /* Professional */
  const [equipment, setEquipment]     = useState(["Sony A7R IV","Canon 5D Mark IV","24-70mm f/2.8 GM"]);
  const [languages, setLanguages]     = useState(["Tiếng Việt (bản địa)","Tiếng Anh (lưu loát)"]);
  const [styles, setStyles]           = useState(["Tự nhiên","Editorial"]);

  /* Portfolio */
  const [portfolio, setPortfolio]     = useState<Portfolio[]>([
    { id:"1", url:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80", cover:true  },
    { id:"2", url:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", cover:false },
    { id:"3", url:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80", cover:false },
  ]);

  /* Services */
  const [packages, setPackages]       = useState<Pkg[]>([
    { id:"1", category:"Bất động sản", name:"Chụp ảnh Bất động sản Cao cấp", price:"450", unit:"buổi", desc:"Gói tài liệu bao gồm 20 ảnh đã chỉnh sửa kỹ lưỡng, phù hợp cho các hộ cao cấp hoặc bất thụ. Thời...", active:true },
    { id:"2", category:"Thương mại",   name:"Chụp ảnh Sản phẩm Editorial",   price:"800", unit:"ngày",  desc:"Dành cho các chiến dịch quảng cáo, lookbook. Bao gồm setup ảnh xứng studio phức tạp và định hướng nghề...", active:true },
  ]);
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [editPkg, setEditPkg]         = useState<Pkg|null>(null);
  const [pkgForm, setPkgForm]         = useState({ category:"", name:"", price:"", unit:"buổi", desc:"" });

  /* UI state */
  const [saved, setSaved]             = useState(false);
  const avatarRef                     = useRef<HTMLInputElement>(null);
  const portfolioRef                  = useRef<HTMLInputElement>(null);

  /* ── Handlers ── */
  function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader(); r.onload=ev=>setAvatar(ev.target?.result as string); r.readAsDataURL(f);
  }
  function handlePortfolioAdd(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files??[]).forEach(f=>{
      const r = new FileReader(); r.onload=ev=>{
        setPortfolio(cur=>[...cur,{id:Date.now()+Math.random()+"",url:ev.target?.result as string,cover:cur.length===0}]);
      }; r.readAsDataURL(f);
    });
  }
  function setCover(id:string){ setPortfolio(c=>c.map(p=>({...p,cover:p.id===id}))); }
  function removePortfolio(id:string){ setPortfolio(c=>c.filter(p=>p.id!==id)); }

  function openNewPkg(){
    setPkgForm({category:"",name:"",price:"",unit:"buổi",desc:""});
    setEditPkg(null); setShowPkgForm(true);
  }
  function openEditPkg(p:Pkg){
    setPkgForm({category:p.category,name:p.name,price:p.price,unit:p.unit,desc:p.desc});
    setEditPkg(p); setShowPkgForm(true);
  }
  function savePkg(){
    if(!pkgForm.name.trim()) return;
    if(editPkg) setPackages(c=>c.map(p=>p.id===editPkg.id?{...p,...pkgForm}:p));
    else        setPackages(c=>[...c,{id:Date.now()+"",active:true,...pkgForm}]);
    setShowPkgForm(false);
  }
  function togglePkg(id:string){ setPackages(c=>c.map(p=>p.id===id?{...p,active:!p.active}:p)); }
  function deletePkg(id:string){ setPackages(c=>c.filter(p=>p.id!==id)); }

  function handleSave(){ setSaved(true); setTimeout(()=>setSaved(false),2500); }

  const bioLen = bio.length;

  return (
    <div className="px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-[720px] space-y-5 pb-14">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hồ Sơ Nhiếp ảnh gia</h1>
            <p className="mt-0.5 text-xs text-slate-400">Quản lý cách bạn xuất hiện trước khách hàng trên Photor AI.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">Hủy</button>
            <button onClick={handleSave}
              className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-orange-600 transition">
              {saved?"✓ Đã lưu":"Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* ── 1. Thông tin cơ bản ── */}
        <Section icon="⚡" title="Thông tin cơ bản">
          <div className="flex flex-col gap-5 sm:flex-row">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div onClick={()=>avatarRef.current?.click()}
                className="relative h-[88px] w-[88px] cursor-pointer overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 hover:opacity-90 transition">
                {avatar
                  ? <img src={avatar} alt="avatar" className="h-full w-full object-cover"/>
                  : <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-400">{name.charAt(0)}</div>
                }
                <div className="absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 shadow">
                  <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar}/>
              <p className="text-center text-[10px] text-slate-400 leading-4">Đính dạng JPG, PNG<br/>Tối đa 5MB</p>
            </div>
            {/* Fields */}
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-500">Tên hiển thị</p>
                  <TInput value={name} onChange={setName} placeholder="Tên của bạn"/>
                </div>
                <div>
                  <p className="mb-1.5 text-xs font-semibold text-slate-500">Chức danh chuyên môn</p>
                  <TInput value={title} onChange={setTitle} placeholder="Nhiếp ảnh gia thương mại"/>
                </div>
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-500">Tiểu sử</p>
                  <span className="text-[10px] text-slate-400">{bioLen}/500</span>
                </div>
                <TInput value={bio} onChange={setBio} placeholder="Mô tả kinh nghiệm và phong cách..." rows={4}/>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><p className="mb-1.5 text-xs font-semibold text-slate-500">Email liên hệ</p><TInput value={email} onChange={setEmail} type="email" placeholder="email@example.com"/></div>
            <div><p className="mb-1.5 text-xs font-semibold text-slate-500">Số điện thoại</p><TInput value={phone} onChange={setPhone} placeholder="0909 123 456"/></div>
            <div><p className="mb-1.5 text-xs font-semibold text-slate-500">Website</p><TInput value={website} onChange={setWebsite} placeholder="https://yourportfolio.com"/></div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500">Trạng thái</p>
              <div className="flex h-[46px] items-center gap-3 rounded-2xl border border-slate-200 bg-[#f8f9fb] px-4">
                <Toggle on={isActive} onToggle={()=>setIsActive(!isActive)}/>
                <span className={`text-sm font-semibold ${isActive?"text-emerald-600":"text-slate-400"}`}>
                  {isActive?"Đang nhận booking":"Tạm ngừng"}
                </span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. Thông tin chuyên môn ── */}
        <Section icon="🎯" title="Thông tin chuyên môn">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500">Danh sách thiết bị</p>
              <TagPicker items={equipment} opts={EQUIPMENT_OPTS}
                onAdd={v=>setEquipment(c=>[...c,v])} onRemove={v=>setEquipment(c=>c.filter(x=>x!==v))}
                placeholder="Thêm thiết bị"/>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500">Vị trí hoạt động chính</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f8f9fb] px-3 py-2.5">
                  <svg className="h-4 w-4 shrink-0 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <input value={location} onChange={e=>setLocation(e.target.value)} className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300" placeholder="TP. Hồ Chí Minh..."/>
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#f8f9fb] px-3 py-2.5">
                  <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <input value={available} onChange={e=>setAvailable(e.target.value)} className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-300" placeholder="Sẵn sàng đi công tác xa"/>
                </div>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-slate-500">Ngôn ngữ</p>
              <TagPicker items={languages} opts={LANG_OPTS}
                onAdd={v=>setLanguages(c=>[...c,v])} onRemove={v=>setLanguages(c=>c.filter(x=>x!==v))}
                placeholder="Thêm ngôn ngữ"/>
            </div>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-500">Phong cách chụp</p>
            <div className="flex flex-wrap gap-2">
              {STYLE_OPTS.map(s=>(
                <button key={s} type="button"
                  onClick={()=>setStyles(c=>c.includes(s)?c.filter(x=>x!==s):[...c,s])}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${styles.includes(s)?"border-orange-300 bg-orange-50 text-orange-600":"border-slate-200 bg-white text-slate-500 hover:border-orange-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── 3. Portfolio ── */}
        <Section icon="🖼️" title="Ảnh nổi bật (Portfolio)"
          subtitle="Chọn 4 bức ảnh ấn tượng nhất để hiển thị ở đầu trang hồ sơ của bạn."
          right={
            <div className="flex gap-2 shrink-0">
              <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
                Sắp xếp
              </button>
              <button onClick={()=>portfolioRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                Tải lên
              </button>
              <input ref={portfolioRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePortfolioAdd}/>
            </div>
          }>

          {portfolio.length===0 ? (
            <div onClick={()=>portfolioRef.current?.click()}
              className="flex h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50 transition">
              <svg className="h-10 w-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="mt-2 text-sm text-slate-400">Click để tải ảnh lên</p>
            </div>
          ) : (
            /* Masonry-style 2-col grid giống ảnh thiết kế */
            <div className="grid grid-cols-2 gap-2" style={{gridTemplateRows:"auto"}}>
              {/* Ảnh bìa lớn bên trái */}
              <div className="group relative overflow-hidden rounded-2xl bg-slate-100" style={{gridRow:"span 2"}}>
                <img src={portfolio[0]?.url} alt="" className="h-full w-full object-cover transition group-hover:scale-105 duration-300" style={{minHeight:"280px"}}/>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition"/>
                <span className="absolute left-2.5 top-2.5 rounded-xl bg-orange-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">Ảnh chính</span>
                <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={()=>removePortfolio(portfolio[0]?.id)}
                    className="rounded-xl bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">Xoá</button>
                </div>
              </div>
              {/* 2 ảnh nhỏ bên phải */}
              {portfolio.slice(1,3).map((p,i)=>(
                <div key={p.id} className="group relative overflow-hidden rounded-2xl bg-slate-100 aspect-video">
                  <img src={p.url} alt="" className="h-full w-full object-cover transition group-hover:scale-105 duration-300"/>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition"/>
                  <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={()=>setCover(p.id)}
                      className="rounded-xl bg-white px-2 py-1 text-[10px] font-bold text-slate-700 shadow hover:bg-orange-50">Đặt bìa</button>
                    <button onClick={()=>removePortfolio(p.id)}
                      className="rounded-xl bg-red-500 px-2 py-1 text-[10px] font-bold text-white shadow">Xoá</button>
                  </div>
                </div>
              ))}
              {/* Thêm ảnh */}
              {portfolio.length<4&&(
                <button onClick={()=>portfolioRef.current?.click()}
                  className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-orange-300 hover:bg-orange-50 transition">
                  <svg className="h-7 w-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                  </svg>
                </button>
              )}
            </div>
          )}
        </Section>

        {/* ── 4. Các gói dịch vụ ── */}
        <Section icon="📦" title="Các gói dịch vụ"
          right={
            <button onClick={openNewPkg}
              className="flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-700 transition shrink-0">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
              Thêm dịch vụ mới
            </button>
          }>

          {/* Form inline */}
          {showPkgForm&&(
            <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
              <p className="mb-3 text-sm font-bold text-slate-700">{editPkg?"Chỉnh sửa":"Dịch vụ mới"}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <p className="mb-1 text-xs font-semibold text-slate-500">Danh mục</p>
                  <TInput value={pkgForm.category} onChange={v=>setPkgForm(f=>({...f,category:v}))} placeholder="Thương mại, Cưới hỏi..."/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="mb-1 text-xs font-semibold text-slate-500">Tên dịch vụ *</p>
                  <TInput value={pkgForm.name} onChange={v=>setPkgForm(f=>({...f,name:v}))} placeholder="Chụp ảnh sản phẩm Editorial"/>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Giá ($)</p>
                  <TInput value={pkgForm.price} onChange={v=>setPkgForm(f=>({...f,price:v}))} placeholder="450"/>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Đơn vị</p>
                  <select value={pkgForm.unit} onChange={e=>setPkgForm(f=>({...f,unit:e.target.value}))}
                    className="w-full rounded-2xl border border-slate-200 bg-[#f8f9fb] px-4 py-3 text-sm text-slate-700 outline-none focus:border-orange-400 transition">
                    {UNIT_OPTS.map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <p className="mb-1 text-xs font-semibold text-slate-500">Mô tả</p>
                  <TInput value={pkgForm.desc} onChange={v=>setPkgForm(f=>({...f,desc:v}))} placeholder="Mô tả chi tiết..." rows={2}/>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={savePkg} className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition">
                  {editPkg?"Lưu":"Tạo dịch vụ"}
                </button>
                <button onClick={()=>setShowPkgForm(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                  Huỷ
                </button>
              </div>
            </div>
          )}

          {/* Cards */}
          {packages.length===0&&!showPkgForm ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có gói dịch vụ nào.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {packages.map(p=>{
                const cat = SVC_CATS.find(c=>p.category.toLowerCase().includes(c.id)||c.label.toLowerCase().includes(p.category.toLowerCase()));
                return (
                  <div key={p.id} className={`rounded-2xl border bg-white p-4 transition ${p.active?"border-slate-200":"border-slate-100 opacity-60"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          {p.category&&(
                            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${cat?.color??"bg-slate-50 border-slate-200 text-slate-600"}`}>
                              {p.category}
                            </span>
                          )}
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.active?"bg-emerald-50 text-emerald-600":"bg-slate-100 text-slate-400"}`}>
                            {p.active?"● Đang hoạt động":"● Tạm ẩn"}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 leading-snug">{p.name}</p>
                        <p className="mt-0.5 text-base font-bold text-orange-500">
                          ${p.price}<span className="text-xs font-normal text-slate-400">/{p.unit}</span>
                        </p>
                        {p.desc&&<p className="mt-1 line-clamp-2 text-xs text-slate-400">{p.desc}</p>}
                      </div>
                      <button onClick={()=>openEditPkg(p)} className="shrink-0 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 transition">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-3 border-t border-slate-50 pt-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Giao file trong 48h
                      </div>
                      <span className="text-slate-200">·</span>
                      <button onClick={()=>togglePkg(p.id)} className="text-xs font-semibold text-slate-400 hover:text-orange-500 transition">
                        {p.active?"Tạm ẩn":"Kích hoạt"}
                      </button>
                      <span className="text-slate-200">·</span>
                      <button onClick={()=>deletePkg(p.id)} className="text-xs font-semibold text-red-400 hover:text-red-600 transition">Xoá</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* Bottom save */}
        <div className="flex justify-end gap-2 pt-1">
          <button className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">Hủy</button>
          <button onClick={handleSave}
            className="rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-orange-600 transition">
            {saved?"✓ Đã lưu thay đổi":"Lưu thay đổi"}
          </button>
        </div>

      </div>
    </div>
  );
}
