const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1487094062589935707/2B83r4RPkrEi6GTK809l094rjV-ZYwmKdYxeAHieBAX91VgF2KCKwCOY8GKCb8Zv8mXH";

app.post("/github", async (req, res) => {
  const data = req.body;
  const commit = data.head_commit;

  if (!commit) return res.sendStatus(200);

  try {
    // pega detalhes do commit (sem token mesmo)
    const response = await axios.get(commit.url);
    const details = response.data;

    // separa título e descrição
    const mensagem = commit.message.split("\n");
    const titulo = mensagem[0];
    const descricao = mensagem.slice(1).join("\n") || "Sem descrição";

    // lista arquivos (máx 10 pra não quebrar o Discord)
    const arquivos = details.files
      .slice(0, 10)
      .map(f => `• ${f.filename}`)
      .join("\n");

    const embed = {
      title: `🚀 ${titulo}`,
      description: descricao,
      color: 0xe74c3c, // 🔴 sempre vermelho
      fields: [
        {
          name: "👤 Autor",
          value: commit.author.name,
          inline: true
        },
        {
          name: "🌿 Branch",
          value: data.ref.replace("refs/heads/", ""),
          inline: true
        },
        {
          name: "📁 Arquivos alterados",
          value: arquivos || "Nenhum arquivo",
        }
      ],
      footer: {
        text: data.repository.name
      },
      url: commit.url,
      timestamp: new Date().toISOString()
    };

    await axios.post(DISCORD_WEBHOOK_URL, {
      embeds: [embed]
    });

  } catch (err) {
    console.error(err);
  }

  res.sendStatus(200);
});

// rota de teste
app.get("/", (req, res) => {
  res.send("Servidor rodando 👍");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando"));