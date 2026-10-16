#!/bin/sh
set -eu

set -- $(date '+%s %w %H %M %z')
sunday=$(date -d "@$(($1 - $2 * 86400))" '+%Y-%m-%d')

printf '%sT%02d:%s:%s%s\n' "$sunday" "$2" "$3" "$4" "$5"
