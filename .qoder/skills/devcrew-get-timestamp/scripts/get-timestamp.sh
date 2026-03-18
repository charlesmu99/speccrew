#!/bin/bash
# Get current timestamp in specified format

FORMAT="${1:-YYYY-MM-DD-HHmm}"

case "$FORMAT" in
    "YYYY-MM-DD-HHmm")
        date +"%Y-%m-%d-%H%M"
        ;;
    "YYYY-MM-DD")
        date +"%Y-%m-%d"
        ;;
    "HHmm")
        date +"%H%M"
        ;;
    "ISO")
        date -Iseconds
        ;;
    *)
        date +"%Y-%m-%d-%H%M"
        ;;
esac
