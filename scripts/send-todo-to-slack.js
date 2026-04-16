const fs = require('fs');
const https = require('https');

// TODOリストを読み込み
const todoList = JSON.parse(fs.readFileSync('todo-list.json', 'utf8'));

// Slackメッセージを整形
function formatTodoMessage(todos) {
  let message = '📋 *本日のTODOリスト*\n\n';

  const priorityGroups = {
    '最高（至急）': [],
    '高': [],
    '土日対応': [],
    'その他': []
  };

  // 優先度ごとにグループ化
  todos.forEach(todo => {
    if (todo.status !== 'completed') {
      priorityGroups[todo.priority].push(todo);
    }
  });

  // 優先度ごとに表示
  Object.entries(priorityGroups).forEach(([priority, items]) => {
    if (items.length > 0) {
      const emoji = priority === '最高（至急）' ? '🔴' :
                    priority === '高' ? '🔴' :
                    priority === '土日対応' ? '🟡' : '📝';
      message += `${emoji} *優先度：${priority}*\n`;

      items.forEach((item, index) => {
        message += `${index + 1}. *${item.title}*\n`;
        if (item.deadline) {
          message += `   ⏰ 期限: ${item.deadline}\n`;
        }
        if (item.details) {
          message += `   ${item.details}\n`;
        }
        if (item.link) {
          message += `   🔗 ${item.link}\n`;
        }
        message += '\n';
      });
    }
  });

  message += `\n_最終更新: ${todoList.last_updated}_`;

  return message;
}

// Slackに送信
function sendToSlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('Error: SLACK_WEBHOOK_URL environment variable is not set');
    process.exit(1);
  }

  const payload = JSON.stringify({
    text: message,
    mrkdwn: true
  });

  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ TODOリストをSlackに送信しました');
      } else {
        console.error(`❌ 送信失敗: ${res.statusCode} - ${data}`);
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  });

  req.write(payload);
  req.end();
}

// メイン処理
const message = formatTodoMessage(todoList.todos);
console.log('送信するメッセージ:');
console.log(message);
console.log('\n---\n');
sendToSlack(message);
