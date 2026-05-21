#!/usr/bin/env python3
"""Convert JSONL to JSON for GitHub Pages."""

import json
from pathlib import Path


def convert_jsonl_to_json(jsonl_path: Path, json_path: Path) -> None:
    """Convert JSONL file to JSON array."""
    records = []
    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=2)

    print(f"Converted {len(records)} records: {jsonl_path} -> {json_path}")


if __name__ == "__main__":
    data_dir = Path(__file__).parent / "data"
    data_dir.mkdir(exist_ok=True)
    convert_jsonl_to_json(data_dir / "novels.jsonl", data_dir / "novels.json")
