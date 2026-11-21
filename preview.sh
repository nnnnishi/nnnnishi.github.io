#!/bin/sh
# ローカルプレビュー: ./preview.sh → http://localhost:4000 （保存すると自動で再生成）
cd "$(dirname "$0")"
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
exec "$(ls /opt/homebrew/lib/ruby/gems/*/bin/jekyll | tail -1)" serve --livereload "$@"
