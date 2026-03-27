const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const DISCORD_WEBHOOK_URL = "COLOCA_AQUI";

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

app.listen(3000, () => console.log("Rodando na porta 3000"));