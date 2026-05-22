#!/usr/bin/env python3
"""
Build script for generating static HTML files from Jinja2 templates.
Outputs to build/ directory ready for GitHub Pages.
"""

import json
import shutil
from datetime import datetime
from pathlib import Path

from jinja2 import Environment, FileSystemLoader


def load_novels() -> list:
    """Load novels data from JSON file."""
    data_file = Path(__file__).parent / "data" / "novels.json"
    with open(data_file, "r", encoding="utf-8") as f:
        return json.load(f)


def format_update_time() -> str:
    """Format current time for display."""
    return datetime.now().strftime("%Y-%m-%d %H:%M")


def split_intro(intro: str) -> list:
    """Split intro text into paragraphs."""
    if not intro:
        return ["暂无简介"]
    return [p.strip() for p in intro.split("\n") if p.strip()]


def build_site():
    """Build static site from templates."""
    base_dir = Path(__file__).parent
    build_dir = base_dir / "build"
    static_dir = base_dir / "static"
    templates_dir = base_dir / "templates"

    # Clean and create build directory
    if build_dir.exists():
        shutil.rmtree(build_dir)
    build_dir.mkdir(parents=True)

    # Copy static files
    static_build_dir = build_dir / "static"
    if static_dir.exists():
        shutil.copytree(static_dir, static_build_dir)

    # Setup Jinja2
    env = Environment(loader=FileSystemLoader(templates_dir))
    env.trim_blocks = True
    env.lstrip_blocks = True

    # Helper to create safe type filename
    def safe_type_filename(type_name: str) -> str:
        return type_name.lower().replace(" ", "-")
    env.filters["safe_type"] = safe_type_filename

    # Load data
    novels = load_novels()
    update_time = format_update_time()
    novels_json = json.dumps(novels, ensure_ascii=False)
    cover_base_url = "https://osrs.sfacg.com/web/novel/images/NovelCover/Big/"

    # Calculate stats for homepage
    type_counts = {}
    for novel in novels:
        t = novel.get("TypeName", "Unknown")
        type_counts[t] = type_counts.get(t, 0) + 1

    # Featured novels (first 6)
    featured_novels = novels[:6]

    # Render homepage
    index_template = env.get_template("index.html")
    index_html = index_template.render(
        total_novels=len(novels),
        featured_novels=featured_novels,
        type_counts=type_counts,
        update_time=update_time,
        cover_base_url=cover_base_url,
        base_path="",
    )

    with open(build_dir / "index.html", "w", encoding="utf-8") as f:
        f.write(index_html)

    # Render about page
    about_template = env.get_template("about.html")
    about_html = about_template.render(
        update_time=update_time,
        base_path="",
    )
    with open(build_dir / "about.html", "w", encoding="utf-8") as f:
        f.write(about_html)
    print(f"Generated: about.html")


    # Render list page with pagination
    list_template = env.get_template("list.html")
    novels_per_page = 20
    total_pages = (len(novels) + novels_per_page - 1) // novels_per_page

    for page_num in range(1, total_pages + 1):
        start_idx = (page_num - 1) * novels_per_page
        end_idx = start_idx + novels_per_page
        page_novels = novels[start_idx:end_idx]

        list_html = list_template.render(
            novels=page_novels,
            novels_json=novels_json,
            update_time=update_time,
            cover_base_url=cover_base_url,
            base_path="",
            current_page=page_num,
            total_pages=total_pages,
            total_novels=len(novels),
        )

        if page_num == 1:
            filename = "list.html"
        else:
            filename = f"list_{page_num}.html"

        with open(build_dir / filename, "w", encoding="utf-8") as f:
            f.write(list_html)

    print(f"Generated: list.html ({total_pages} pages, {len(novels)} novels)")

    # Render type pages to type/ directory
    type_template = env.get_template("type.html")
    type_dir = build_dir / "type"
    type_dir.mkdir(exist_ok=True)

    for type_name in type_counts.keys():
        type_novels = [n for n in novels if n.get("TypeName") == type_name]
        type_html = type_template.render(
            type_name=type_name,
            novels=type_novels,
            novels_json=json.dumps(type_novels, ensure_ascii=False),
            update_time=update_time,
            cover_base_url=cover_base_url,
            base_path="../",
            total_novels=len(type_novels),
        )

        safe_type_name = safe_type_filename(type_name)
        with open(type_dir / f"{safe_type_name}.html", "w", encoding="utf-8") as f:
            f.write(type_html)

    print(f"Generated: {len(type_counts)} type pages in type/")

    # Render individual novel pages to n/ directory
    detail_template = env.get_template("detail.html")
    n_dir = build_dir / "n"
    n_dir.mkdir(exist_ok=True)

    for novel in novels:
        intro_paragraphs = split_intro(novel.get("Intro", ""))

        detail_html = detail_template.render(
            novel=novel,
            update_time=update_time,
            cover_base_url=cover_base_url,
            intro_paragraphs=intro_paragraphs,
            base_path="../",
        )

        filename = f"{novel['NovelID']}.html"
        with open(n_dir / filename, "w", encoding="utf-8") as f:
            f.write(detail_html)

    print(f"Generated: {len(novels)} novel detail pages in n/")
    print(f"Build complete: {build_dir}")


if __name__ == "__main__":
    build_site()
