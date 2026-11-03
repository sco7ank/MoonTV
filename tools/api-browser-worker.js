const HTML_URL = "https://raw.githubusercontent.com/sco7ank/MoonTV/main/docs/api-browser.html";
const CONFIG_URL = "https://raw.githubusercontent.com/sco7ank/MoonTV/main/config/moontv-63-sources.json";
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
function json(data, status=200) { return new Response(JSON.stringify(data), {status, headers: JSON_HEADERS}); }
export default {
 async fetch(request) {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") return new Response(null,{headers:{"access-control-allow-origin":"*","access-control-allow-methods":"GET,OPTIONS","access-control-allow-headers":"*"}});
  if (url.pathname === "/" || url.pathname === "/index.html") {
   const r = await fetch(HTML_URL, {cf:{cacheTtl:60,cacheEverything:true}});
   return new Response(r.body,{status:r.status,headers:{"content-type":"text/html; charset=utf-8","cache-control":"public, max-age=60"}});
  }
  if (url.pathname === "/api/config") {
   const r=await fetch(CONFIG_URL,{cf:{cacheTtl:300,cacheEverything:true}});
   if(!r.ok)return json({error:"配置文件读取失败"},502);
   return new Response(r.body,{headers:JSON_HEADERS});
  }
  if (url.pathname === "/api/proxy") {
   if(request.method!=="GET")return json({error:"仅支持 GET"},405);
   const source=url.searchParams.get("source");
   if(!source)return json({error:"缺少 source 参数"},400);
   const cr=await fetch(CONFIG_URL,{cf:{cacheTtl:300,cacheEverything:true}});
   if(!cr.ok)return json({error:"无法读取源配置"},502);
   const config=await cr.json();
   const item=config.api_site?.[source];
   if(!item?.api)return json({error:"源不存在或未配置 API"},404);
   const upstream=new URL(item.api);
   const allowed=new Set(["ac","wd","t","pg","h","ids"]);
   for(const [k,v] of url.searchParams)if(k!=="source"&&allowed.has(k))upstream.searchParams.set(k,v);
   try {
    const r=await fetch(upstream.toString(),{headers:{"accept":"application/json,text/plain,*/*","user-agent":"Mozilla/5.0 MoonTV-Resource-Browser"},signal:AbortSignal.timeout(15000)});
    const body=await r.text();
    return new Response(body,{status:r.status,headers:{"content-type":r.headers.get("content-type")||"application/json; charset=utf-8","cache-control":"no-store","access-control-allow-origin":"*"}});
   } catch(e) { return json({error:"资源站连接失败或超时",detail:String(e).slice(0,180)},502); }
  }
  return json({error:"Not found"},404);
 }
};