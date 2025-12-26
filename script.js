// 配置：请使用你自己的 Geonames 用户名
const GEONAMES_USERNAME = 'Misaka1008611';

const countrySelect = document.getElementById('country');
const admin1Select = document.getElementById('admin1');
const statusEl = document.getElementById('status');
const timezoneEl = document.getElementById('timezone');

// 防止并发请求覆盖（request token）
let lastAdminRequestGeoId = null;

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

function setStatus(text){
  if(statusEl) statusEl.textContent = text || '';
}

async function loadCountries(){
  setStatus('加载国家/地区列表...');
  countrySelect.disabled = true;
  try{
    const url = `https://secure.geonames.org/countryInfoJSON?username=${GEONAMES_USERNAME}`;
    const data = await fetchJSON(url);
    const items = data.geonames || [];
    countrySelect.innerHTML = '<option value="">请选择国家/地区</option>';
    items.sort((a,b)=>a.countryName.localeCompare(b.countryName, undefined, {sensitivity:'base'}));
    items.forEach(c=>{
      const opt = document.createElement('option');
      opt.value = c.geonameId; // 用 geonameId 查询下级
      opt.textContent = `${c.countryName} (${c.countryCode})`;
      opt.dataset.countryCode = c.countryCode;
      countrySelect.appendChild(opt);
    });
    setStatus('');
  }catch(err){
    setStatus('加载国家/地区失败：' + err.message);
    countrySelect.innerHTML = '<option value="">加载失败，请重试</option>';
  }finally{
    countrySelect.disabled = false;
  }
}

async function loadAdmin1(geonameId){
  lastAdminRequestGeoId = String(geonameId);
  admin1Select.disabled = true;
  admin1Select.innerHTML = '<option value="">正在加载…</option>';
  try{
    const url = `https://secure.geonames.org/childrenJSON?geonameId=${geonameId}&username=${GEONAMES_USERNAME}`;
    const data = await fetchJSON(url);
    const items = data.geonames || [];
    if(String(lastAdminRequestGeoId) !== String(geonameId)) return items;
    admin1Select.innerHTML = '<option value="">请选择省/州</option>';
    if(items.length === 0){
      admin1Select.innerHTML = '<option value="">无下级行政区</option>';
      return items;
    }
    items.forEach(s=>{
      const opt = document.createElement('option');
      opt.value = s.geonameId;
      opt.textContent = s.name;
      // 尝试保存经纬度到 option 的 data 属性用于后续时区查询
      if(s.lat) opt.dataset.lat = s.lat;
      if(s.lng) opt.dataset.lng = s.lng;
      if(s.latitude) opt.dataset.lat = s.latitude;
      if(s.longitude) opt.dataset.lng = s.longitude;
      admin1Select.appendChild(opt);
    });
    return items;
  }catch(err){
    admin1Select.innerHTML = '<option value="">加载失败</option>';
    setStatus('加载省/州失败：' + err.message);
    return [];
  }finally{
    admin1Select.disabled = false;
  }
}

async function loadTimezone(lat, lng){
  if(!timezoneEl) return;
  timezoneEl.textContent = '加载时区信息...';
  try{
    const url = `https://secure.geonames.org/timezoneJSON?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&username=${GEONAMES_USERNAME}`;
    const data = await fetchJSON(url);
    if(data && data.timezoneId){
      const sign = (typeof data.gmtOffset === 'number' && data.gmtOffset >= 0) ? '+' : '';
      timezoneEl.textContent = `时区：${data.timezoneId}（UTC${sign}${data.gmtOffset}），当前时间：${data.time}`;
    }else{
      timezoneEl.textContent = '无法获取时区信息';
    }
  }catch(err){
    timezoneEl.textContent = '加载时区失败：' + err.message;
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  admin1Select.disabled = true;
  admin1Select.innerHTML = '<option value="">请选择国家/地区后加载</option>';
  loadCountries();

  const clearBtn = document.getElementById('clear-selection');
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      countrySelect.selectedIndex = 0;
      admin1Select.innerHTML = '<option value="">请选择国家后加载</option>';
      admin1Select.disabled = true;
      if(timezoneEl) timezoneEl.textContent = '未选择省/州';
      setStatus('已清除选择');
      setTimeout(()=>setStatus(''),1500);
    });
  }

  countrySelect.addEventListener('change', e=>{
    const id = e.target.value;
    if(!id){
      admin1Select.innerHTML = '<option value="">请选择国家/地区后加载</option>';
      return;
    }
    setStatus('加载省/州...');
    loadAdmin1(id).then(()=>setStatus(''));
  });

  admin1Select.addEventListener('change', e=>{
    const opt = e.target.selectedOptions[0];
    if(!opt) return;
    const lat = opt.dataset.lat;
    const lng = opt.dataset.lng;
    if(lat && lng){
      loadTimezone(lat, lng);
    }else{
      timezoneEl.textContent = '无可用的经纬度，无法获取时区';
    }
  });
});
