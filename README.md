# Naoki Nishimura's homepage

GitHub Pages（Jekyll）で公開する自己紹介サイト。業績は YAML で管理し、ページは自動生成される。

## ページ構成
| URL | ファイル | 中身 |
|---|---|---|
| `/` | `index.html` | Research Interests・News |
| `/publications/` | `publications/index.html` | 論文・記事・書籍・特許（全件） |
| `/talks/` | `talks/index.html` | 学会発表・招待講演（全件） |
| `/cv/` | `cv/index.html` | 所属・職歴・授業・学歴・受賞 |
| `/survey/budget-uplift/` | `survey/budget-uplift/index.html` | 予算制約つきアップリフトの文献リスト。nav・トップからはリンクしていない（sitemap にも出ない）。中身は `_data/survey_budget_uplift.yml` |

共通のヘッダー・ナビ・フッターは `_layouts/default.html`、ナビの項目は `_config.yml` の `nav`。

## 内容を追加・修正する
| 内容 | ファイル | メモ |
|---|---|---|
| 論文・記事・書籍・特許 | `_data/papers.yml` | `type` で分類。上から順に表示されるので新しいものを先頭に |
| 口頭発表・講演 | `_data/presentations.yml` | 共著も含めてすべて記載。`presenter` に発表者（○）、`scope: international/domestic`、依頼講演は `invited: true`。`date` (YYYY-MM) で自動ソート |
| 受賞 | `_data/awards.yml` | `date` で自動ソート |
| 授業 | `_data/teaching.yml` | 上から順に表示。`links` に年度ごとのシラバス |
| News | `_data/news.yml` | 新しいものを先頭に。トップには上から5件 |
| Research Interests | `_data/research.yml` | テーマ・例・代表的な成果 |
| 所属・職歴・学歴 | `cv/index.html` | 直接編集 |

自分の名前（太字にする表記）は `_config.yml` の `me` に列挙。`sitemap.xml` はビルド時に自動生成。

## ローカル確認
```sh
./preview.sh   # → http://localhost:4000（ファイルを保存すると自動でリロード。_config.yml を変えたときは再起動）
```
