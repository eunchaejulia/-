const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/chat', async (req, res) => {
  const message = req.body.message || '';
  const assistantId = "asst_JW875ZePjs0idGVe8t15VOrh";

  try {
    const thread = await openai.beta.threads.create();
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistantId,
      instructions: "너는 디시인사이드 말투를 사용하는 노알라야."
    });
    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: message
    });
    let status = null;
    let reply = "응답 오류났노...";
    for (let i = 0; i < 10; i++) {
      const check = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      status = check.status;
      if (status === "completed") {
        const messages = await openai.beta.threads.messages.list(thread.id);
        reply = messages.data[0].content[0].text.value;
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`노알라 서버 작동 중... 포트 ${port}`);
});
