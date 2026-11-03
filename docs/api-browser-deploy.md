# MoonTV API 资源浏览器部署

本工具由静态前端页面 + Cloudflare Worker 代理组成。Worker 负责服务页面、读取 63 源配置，并在服务器端请求资源站 API，避免浏览器跨域限制。

## 部署

1. 打开 Cloudflare 控制台 → **Workers 和 Pages** → **创建** → **创建 Worker**。
2. Worker 名称可填写 `moontv-api-browser`。
3. 进入代码编辑器，将本仓库的 `tools/api-browser-worker.js` 全部内容复制进去，替换默认示例代码。
4. 点击 **部署**。
5. 打开 Cloudflare 分配的 `https://你的Worker名称.你的子域.workers.dev/`。

页面会自动读取本仓库的 `config/moontv-63-sources.json`，无需手动填写 63 个 API。

## 页面功能

- 普通源 / 成人源 / 全部源切换
- 资源源切换
- 分类筛选
- 影片关键词搜索
- 影片列表、分页
- 影片详情、播放线路和播放地址查看

## 注意

- 必须通过部署后的 Worker 地址访问，不要直接用 GitHub 文件预览或 htmlpreview 打开；那些页面没有同源的 `/api/proxy` 代理接口。
- 资源站是否可用由源站决定。部分资源站可能限流、失效、要求特定请求头，或不支持标准苹果 CMS 参数。
- 工具只展示资源站返回的目录和播放地址，不托管视频内容。
