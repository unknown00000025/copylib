# 📝 爆款文案库

团队共享的文案积累工具，支持 AI 自动分析分类维度。

## 🚀 部署步骤（10分钟搞定）

### 第一步：上传到 GitHub

1. 打开 [github.com](https://github.com) 登录
2. 点右上角 **+** → **New repository**
3. 名称填 `copylib`，点 **Create repository**
4. 把这个文件夹里所有文件拖进去上传

### 第二步：部署到 Vercel

1. 打开 [vercel.com](https://vercel.com) 用 GitHub 账号登录
2. 点 **Add New Project** → 选择 `copylib` 仓库
3. 点 **Deploy**（先不填环境变量）

### 第三步：填入 API Key

1. 部署完成后，在 Vercel 项目页面点 **Settings**
2. 左侧点 **Environment Variables**
3. 添加一条：
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-你的key`
4. 点 **Save**，然后点 **Deployments** → **Redeploy**

### 第四步：分享给团队

部署完成后会得到一个网址，例如 `https://copylib.vercel.app`
把这个网址分享给团队所有人，大家都能用！

## 📁 文件结构

```
copylib/
├── pages/
│   ├── index.js          # 主页面
│   ├── _app.js           
│   └── api/
│       ├── analyze.js    # AI 分析接口
│       └── copies.js     # 文案增删查接口
├── lib/
│   ├── dimensions.js     # 分类维度数据
│   └── store.js          # 数据存储
├── styles/
│   └── globals.css
├── .env.local            # 本地开发用（不要上传到 GitHub）
├── next.config.js
└── package.json
```

## ⚠️ 注意

- `.env.local` 文件**不要上传到 GitHub**，API Key 要在 Vercel 的环境变量里设置
- 文案数据存在服务器的 `data/copies.json` 文件里，Vercel 重新部署后数据会清空
  - 如需永久保存，可以升级为数据库存储（需要时告诉我）
