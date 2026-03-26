#!/bin/bash
# Get current timestamp in specified format

FORMAT="${1:-YYYY-MM-DD-HHmmss}"

case "$FORMAT" in
    "YYYY-MM-DD-HHmmss")
        date +"%Y-%m-%d-%H%M%S"
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
        date +"%Y-%m-%d-%H%M%S"
        ;;
esac
