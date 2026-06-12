import json
import os
from typing import Any, List

from config import get_config

config = get_config()

LIBRARY_FILE = os.path.join(config.OUTPUT_DIR, "video_library.json")
SHARES_FILE = os.path.join(config.OUTPUT_DIR, "video_shares.json")


def ensure_storage_files() -> None:
    os.makedirs(config.OUTPUT_DIR, exist_ok=True)
    for path in [LIBRARY_FILE, SHARES_FILE]:
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as file:
                json.dump([], file)


def load_json_list(path: str) -> List[Any]:
    ensure_storage_files()
    try:
        with open(path, "r", encoding="utf-8") as file:
            data = json.load(file)
            if isinstance(data, list):
                return data
    except (json.JSONDecodeError, OSError):
        pass
    return []


def save_json_list(path: str, items: List[Any]) -> None:
    ensure_storage_files()
    with open(path, "w", encoding="utf-8") as file:
        json.dump(items, file, indent=2)
