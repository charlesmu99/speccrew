#!/usr/bin/env python3
"""Get current timestamp in YYYY-MM-DD-HHmm format."""
from datetime import datetime
print(datetime.now().strftime("%Y-%m-%d-%H%M"))
