#!/bin/bash
# usage: scripts-dl.sh <dir> <prefix> name:file ...
dir=$1; prefix=$2; shift 2; mkdir -p "public/assets/$dir"
for pair in "$@"; do name=${pair%%:*}; file=${pair#*:}; ext=${file##*.}
  curl -sfL -o "public/assets/$dir/$name.$ext" "$prefix/$file" || echo "FAIL $name"
done
