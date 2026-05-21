.PHONY: crawl convert serve clean test deploy

# 默认目标
all: crawl convert

# 运行爬虫生成 JSONL
crawl:
	uv run scrapy crawl info

# 转换 JSONL 到 JSON
convert:
	uv run python convert.py

# 完整流程：爬虫 + 转换
update: crawl convert

# 本地预览 GitHub Pages
serve:
	cd docs && python3 -m http.server 8000

# 清理数据文件
clean:
	rm -f data/*.jsonl data/*.json docs/data/novels.json

# 测试爬虫（只爬少量页面）
test:
	uv run scrapy crawl info -s CLOSESPIDER_PAGECOUNT=3 -O data/novels.jsonl

# 安装依赖
install:
	uv sync

# 手动部署（复制数据到 docs）
deploy:
	cp data/novels.json docs/data/
