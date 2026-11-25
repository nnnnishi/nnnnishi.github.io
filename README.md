# Naoki Nishimura's homepage

GitHub Pages（Jekyll）で公開する自己紹介サイト。業績は YAML で管理し、ページは自動生成される。

## ページ構成
| URL | ファイル | 中身 |
|---|---|---|
| `/` | `index.html` | Research Interests・News |
| `/publications/` | `publications/index.html` | 論文・記事・書籍・特許（全件） |
| `/talks/` | `talks/index.html` | 学会発表・招待講演（全件） |
| `/cv/` | `cv/index.html` | 所属・職歴・授業・学歴・受賞 |
| `/misc/` | `misc/index.html` | 文献リストなどの一覧（nav の Misc）。節を足して色々置く |
| `/misc/survey/budget-uplift/` | `misc/survey/budget-uplift/index.html` | 予算制約つきアップリフトの文献リスト。中身は `_data/survey_budget_uplift.yml`。解説ページは `papers/<slug>/` |
| `/misc/survey/optimal-tree/` | `misc/survey/optimal-tree/index.html` | 最適決定木の文献リスト。中身は `_data/survey_optimal_tree.yml`。解説ページは `papers/<slug>/` |
| `/misc/survey/pricing/` | `misc/survey/pricing/index.html` | 価格最適化の文献リスト。中身は `_data/survey_pricing.yml`。解説ページは `papers/<slug>/` |
| `/misc/survey/reciprocal-rec/` | `misc/survey/reciprocal-rec/index.html` | 双方向市場の推薦の文献リスト。中身は `_data/survey_reciprocal_rec.yml`。解説ページは `papers/<slug>/` |
| （404） | `404.html` | 旧 URL `/survey/...` を `/misc/survey/...` に転送する |

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
| 文献リストの系譜の図 | `_data/survey_*.yml`（budget-uplift・optimal-tree・pricing・reciprocal-rec の4本とも同じ書き方） | 論文に `short`（図での呼び名）を付け、`lineage` に `from`・`to`・`kind`（`ext` か `base`）・`why` を1行足す。`from`・`to` は論文の `id`（`id` がなければ `explainer`。budget-uplift は解説のある論文を `explainer` で指し、ほかの3本は `id` で指す）。本文で確認できていない矢印は `guess: true`（pricing・reciprocal-rec で「未確認」と表示）。レーンの並びは `lineage_lanes`、研究グループのボタンは `lineage_groups`（論文の `groups` に id を書く）。左端の列にまとめる年は `lineage_first_year`（省略時 2018） |
| 解説ページのティーザー | `misc/survey/assets/teaser-engine.js`（共通）・各ページの `assets/teaser-scenes.js` | 再生エンジンは全解説ページで1つを共有し、各ページは `../../../assets/teaser-engine.js` で読み込む。場面はページごとの `teaser-scenes.js` に書く。エンジンを変えると全ページに効く |
| 所属・職歴・学歴 | `cv/index.html` | 直接編集 |

自分の名前（太字にする表記）は `_config.yml` の `me` に列挙。`sitemap.xml` はビルド時に自動生成（nav の項目と `_config.yml` の `sitemap_extra`）。

## ローカル確認
```sh
./preview.sh   # → http://localhost:4000（ファイルを保存すると自動でリロード。_config.yml を変えたときは再起動）
```
