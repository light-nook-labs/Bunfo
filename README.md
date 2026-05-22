# Bunfo

自动化轻小说收集与展示平台。使用 Scrapy 每日自动抓取 LoloBun 数据，生成静态网站托管于 GitHub Pages。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12+-blue.svg)
![Scrapy](https://img.shields.io/badge/scrapy-2.11+-green.svg)

## 在线访问

[https://light-nook-labs.github.io/Bunfo](https://light-nook-labs.github.io/Bunfo)

## 功能特性

- **自动更新** - GitHub Actions 每日定时抓取最新数据
- **类型浏览** - 按魔法、都市、游戏等类型筛选
- **全文搜索** - 支持标题、类型、标签搜索
- **响应式设计** - 完美适配桌面端与移动端
- **深色/浅色主题** - 一键切换，自动保存偏好
- **静态托管** - 无需服务器，GitHub Pages 直接部署

## 技术栈

| 技术 | 用途 |
|------|------|
| Scrapy | Python 爬虫框架 |
| Jinja2 | 模板引擎生成静态 HTML |
| GitHub Actions | 定时任务与工作流 |
| GitHub Pages | 静态网站托管 |

## 本地开发

```bash
# 安装依赖
make install

# 完整构建（爬虫 + 转换 + 构建）
make update

# 仅构建网站
make build

# 开发模式（自动清理 + 构建 + 本地服务器）
make dev

# 清理数据
make clean
```

访问 http://localhost:8000 预览

## 项目结构

```
Bunfo/
├── bun/                    # Scrapy 爬虫
│   └── spiders/
│       └── info_spider.py  # 主要爬虫
├── templates/              # Jinja2 模板
│   ├── base.html
│   ├── index.html
│   ├── list.html
│   ├── detail.html
│   ├── type.html
│   └── about.html
├── static/                 # 静态资源
│   ├── css/
│   │   ├── themes.css      # 主题变量
│   │   ├── style.css       # 主样式
│   │   ├── index.css       # 首页样式
│   │   └── about.css       # 关于页样式
│   └── js/
│       └── main.js         # 交互逻辑
├── build.py                # 静态网站生成器
├── convert.py              # JSONL 转 JSON
└── Makefile                # 命令管理
```

## 数据来源

数据来源于 [LoloBun](https://www.lolobun.com)，仅供学习交流使用。

## License

MIT License
