const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1487094062589935707/2B83r4RPkrEi6GTK809l094rjV-ZYwmKdYxeAHieBAX91VgF2KCKwCOY8GKCb8Zv8mXH";

const PORT = process.env.PORT || 3000;

app.post("/github", async (req, res) => {
  const data = req.body;

  const commit = data.head_commit;

  if (!commit) return res.sendStatus(200);

  const embed = {
    title: "🚀 Novo commit",
    description: commit.message,
    color: 5814783,
    fields: [
      {
        name: "Autor",
        value: commit.author.name,
        inline: true
      },
      {
        name: "Branch",
        value: data.ref.replace("refs/heads/", ""),
        inline: true
      }
    ],
    footer: {
      text: data.repository.name
    }
  };

  await axios.post(DISCORD_WEBHOOK_URL, {
    embeds: [embed]
  });

  res.sendStatus(200);
});

app.listen(PORT, () => console.log("Rodando"));