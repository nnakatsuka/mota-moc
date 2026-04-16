# MOTA TODOリマインダー

毎日朝9時（JST）にTODOリストをSlackに自動送信するシステム

## セットアップ手順

### 1. Slack Webhook URLの設定

1. Slackワークスペースで Incoming Webhook を作成
   - https://api.slack.com/messaging/webhooks にアクセス
   - 「Create New App」→「From scratch」を選択
   - App名を入力（例：TODO Reminder）
   - ワークスペースを選択
   - 「Incoming Webhooks」を有効化
   - 「Add New Webhook to Workspace」をクリック
   - 投稿先のチャンネルを選択（例：#general または DM）
   - Webhook URLをコピー

2. GitHubリポジトリにシークレットを追加
   - GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」に移動
   - 「New repository secret」をクリック
   - Name: `SLACK_WEBHOOK_URL`
   - Secret: コピーしたWebhook URLを貼り付け
   - 「Add secret」をクリック

### 2. TODOリストの更新

`todo-list.json` ファイルを編集してTODOリストを更新します。

```json
{
  "todos": [
    {
      "priority": "最高（至急）",
      "title": "タスクのタイトル",
      "deadline": "期限（任意）",
      "details": "詳細（任意）",
      "link": "関連リンク（任意）",
      "status": "pending"
    }
  ],
  "last_updated": "YYYY-MM-DD"
}
```

### 3. 手動実行（テスト）

GitHub Actionsの画面から手動で実行できます：

1. リポジトリの「Actions」タブに移動
2. 「毎日のTODOリマインダー」ワークフローを選択
3. 「Run workflow」ボタンをクリック

## ファイル構成

```
.
├── .github/
│   └── workflows/
│       └── daily-todo-reminder.yml  # GitHub Actionsワークフロー
├── scripts/
│   └── send-todo-to-slack.js        # Slack送信スクリプト
├── todo-list.json                    # TODOリスト（編集可能）
└── README.md                         # このファイル
```

## 注意事項

- ワークフローは毎日 00:00 UTC（JST 9:00）に自動実行されます
- TODOリストを更新したら、`last_updated` フィールドも更新してください
- タスクが完了したら、`status` を `"completed"` に変更してください
- 完了したタスクは自動的に非表示になります

## トラブルシューティング

### Slackにメッセージが届かない場合

1. `SLACK_WEBHOOK_URL` シークレットが正しく設定されているか確認
2. GitHub Actionsのログを確認
3. Webhook URLの有効期限が切れていないか確認

### ワークフローが実行されない場合

1. `.github/workflows/daily-todo-reminder.yml` が正しくコミットされているか確認
2. リポジトリの「Actions」が有効になっているか確認
3. 手動実行でテストしてみる
