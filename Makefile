.PHONY: crawl convert build serve clean test install dev

# 默认目标
all: crawl convert build

# 运行爬虫生成 JSONL
crawl:
	uv run scrapy crawl info

# 转换 JSONL 到 JSON
convert:
	uv run python convert.py

# 构建静态网站
build:
	uv run python build.py

# 完整流程：爬虫 + 转换 + 构建
update: crawl convert build

# 本地预览构建后的网站
serve:
	cd build && python3 -m http.server 8000

# 开发模式：先清理、构建，再启动服务器
dev:
	@echo "Cleaning old build..."
	@rm -rf build/
	@echo "Building site..."
	@uv run python build.py
	@echo "Starting server at http://localhost:8000"
	@echo "Press Ctrl+C to stop"
	@cd build && python3 -m http.server 8000

# 清理数据文件
clean:
	rm -rf build/
	rm -f data/*.jsonl data/*.json

# 测试爬虫（只爬少量页面）
test:
	uv run scrapy crawl info -s CLOSESPIDER_PAGECOUNT=3 -O data/novels.jsonl

# 安装依赖
install:
	uv sync
