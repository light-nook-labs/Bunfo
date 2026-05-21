# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bunfo is a Scrapy-based web scraper that fetches novel information from lolobun.com via an AJAX endpoint.

## Commands (Makefile)

- **安装依赖**: `make install`
- **完整更新**: `make update` (crawl + convert)
- **测试爬虫**: `make test` (只爬3页)
- **本地预览**: `make serve` (http://localhost:8000)
- **清理数据**: `make clean`

## 手动命令

- **运行爬虫**: `uv run scrapy crawl info`
- **转换格式**: `uv run python convert.py`

## Architecture

- **Framework**: Scrapy (`bun/spiders/info_spider.py`)
- **Spider name**: `info`
- **Entry point**: `bun/spiders/info_spider.py`

The `InfoSpider` uses a recursive URL construction pattern with timestamp-based cache-busting. It starts at `start()` and yields `Request` objects to paginate through the AJAX endpoint. The spider extracts JSON data and auto-increments the page number until no more data is returned.
