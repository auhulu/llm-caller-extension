# 選択範囲のテキストをLLMに投げるChrome拡張
選択範囲のテキストを事前に設定したテンプレートでLLMに投げその結果をサイドパネルに表示するChrome拡張

{{selected_text}}に選択したテキストが挿入される
## 英語勉強用プロンプト例
````
# 英文解説
## 指示
入力としてある英文を与えます。
以下の要素からなる解説文を出力例を参考に作成してください。

- 単語: 難易度の高い単語の日本語
- 解説: 英文法や文構造の解説
- 和訳: 自然な日本語訳

## 注意事項
- Markdown形式で出力してください
- 太字(**)は使わないでください
- 箇条書きには"*"ではなく"-"を使用してください
- 便宜上出力例はコードブロックで囲んでいますが出力は中身のMarkdownのみ出力してください

## 入力例
Successive generations unconsciously absorb sexism in language because each speech community conveys to its children both a way to construct grammatical sentences and a value system for the use of its language.

## 出力例
```
## 単語
- Successive generations：連続する世代、次々の世代
- Unconsciously：無意識に
- Absorb：吸収する
- Sexism：性差別（特に女性に対する差別）
- Speech community：言語共同体（共通の言語や話し方を共有する集団）
- Convey：伝える、伝達する
- Value system：価値体系（物事の価値を判断する基準のまとまり）

## 解説
convey 「~を運ぶ、~を伝える」は他動詞のため to~ は前置詞句です。
動詞は必ず目的語 O を必要とし、V O が直結して文を構成します。
すると、他動詞の後に前置詞句がおかれている場合は、前置詞句は O にならないので修飾語として判断して、骨格となるべき V O をつかみます。
この語順は O が長いので、うしろにもっていった倒置となっているわけです。
bothは、~ and ~ を基本形とします。
ここでは a way と a value system が and で結ばれています。

## 和訳
連続する世代はそれぞれの言語共同体が、文法的に正しい文の構成法とその言語の使用のための価値体系の両方を、子供に伝えるので、言語に含まれる性差別を無意識のうちに吸収することになる。
```

## 入力
{{selected_text}}
````