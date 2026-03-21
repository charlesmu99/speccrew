#!/usr/bin/env python3
"""Get current timestamp in specified format."""
import argparse
from datetime import datetime

FORMATS = {
    "YYYY-MM-DD-HHmm": "%Y-%m-%d-%H%M",
    "YYYY-MM-DD": "%Y-%m-%d",
    "HHmm": "%H%M",
    "ISO": "%Y-%m-%dT%H:%M:%S%z"
}

def get_timestamp(format_name: str = "YYYY-MM-DD-HHmm") -> str:
    """Get current timestamp in specified format."""
    now = datetime.now()
    if format_name == "ISO":
        return now.astimezone().isoformat()
    return now.strftime(FORMATS.get(format_name, "%Y-%m-%d-%H%M"))

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Get current timestamp")
    parser.add_argument(
        "--format", "-f",
        default="YYYY-MM-DD-HHmm",
        help="Output format (YYYY-MM-DD-HHmm, YYYY-MM-DD, HHmm, ISO)"
    )
    args = parser.parse_args()
    print(get_timestamp(args.format))
