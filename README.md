# Naoki Nishimura's homepage

GitHub Pages（Jekyll）で公開する自己紹介サイト。業績は YAML で管理し、ページは自動生成される。

## 業績を追加・修正する
| 内容 | ファイル | メモ |
|---|---|---|
| 論文・記事・書籍・特許 | `_data/papers.yml` | `type` で分類。ファイルの上から順に表示されるので、新しいものを先頭に追加 |
| 口頭発表・講演 | `_data/presentations.yml` | 共著も含めてすべて記載。`presenter` に発表者（○が付く）、`scope: international/domestic`、依頼講演は `invited: true`。`date` (YYYY-MM) で自動的に新しい順に並ぶ |
| 受賞 | `_data/awards.yml` | `date` で自動ソート |
| 授業 | `_data/teaching.yml` | 上から順に表示。`links` に年度ごとのシラバス |
| 所属・職歴・学歴・プロフィール | `index.html` | 直接編集 |

自分の名前（太字にする表記）は `_config.yml` の `me` に列挙。

## ローカル確認
```sh
/opt/homebrew/lib/ruby/gems/4.0.0/bin/jekyll serve   # → http://localhost:4000
```
（PATH に `/opt/homebrew/opt/ruby/bin` が必要）

更新したら `sitemap.xml` の `lastmod` も直す。
