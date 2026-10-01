// Dripwell service worker: always try the internet first (so every device gets the newest app),
// fall back to the saved copy when offline. Google Drive sync calls are never cached.
const V='dripwell-v1';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
const r=e.request;if(r.method!=='GET')return;
const h=new URL(r.url).hostname;
if(h.endsWith('script.google.com')||h.endsWith('googleusercontent.com'))return;
e.respondWith(fetch(r).then(res=>{
if(res&&(res.ok||res.type==='opaque')){const c=res.clone();caches.open(V).then(ca=>ca.put(r,c))}
return res}).catch(()=>caches.match(r).then(m=>m||(r.mode==='navigate'?caches.match('./index.html').then(x=>x||caches.match('./')):undefined))))});
