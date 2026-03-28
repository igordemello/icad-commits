const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.post("/github", async (req, res) => {
  const data = req.body;
  const commits = data.commits;

  if (!commits || commits.length === 0) return res.sendStatus(200);

  for (const commit of commits) {
    if (commit.message.startsWith("Merge branch 'main' of")) continue;
    try {
      const repo = data.repository.full_name;
      const sha = commit.id;

      const apiUrl = `https://api.github.com/repos/${repo}/commits/${sha}`;

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`
        }
      });
      const details = response.data;

      // separa título e descrição
      const mensagem = commit.message.split("\n");
      const titulo = mensagem[0];
      const descricao = mensagem.slice(1).join("\n") || "Sem descrição";

      const totalArquivos = details.files.length;
      const limite = 10;

      const stats = details.stats;

      const arquivosLista = details.files.slice(0, limite);

      let arquivos = arquivosLista
        .map(f => {
          let emoji = "📄";

          if (f.status === "added") emoji = "🟢";
          if (f.status === "modified") emoji = "🟡";
          if (f.status === "removed") emoji = "🔴";

          return `${emoji} ${f.filename}`;
        })
        .join("\n");

      // adiciona "ver mais" se necessário
      if (totalArquivos > limite) {
        const restantes = totalArquivos - limite;
        arquivos += `\n\n[🔎 Ver mais (${restantes} restantes...)](${commit.url})`;
      }

      const embed = {
        title: `[Commit feito: "${titulo}"]`,
        description: descricao,
        color: 0xe74c3c,

        author: {
          name: commit.author.name,
          icon_url: details.author?.avatar_url || undefined
        },

        fields: [
          {
            name: "Branch",
            value: data.ref.replace("refs/heads/", ""),
            inline: true
          },
          {
            name: "Alterações",
            value:
              `📁 ${totalArquivos} arquivos\n` +
              `➕ ${stats.additions} linhas\n` +
              `➖ ${stats.deletions} linhas`,
            inline: true
          },
          {
            name: "📁 Arquivos alterados",
            value: arquivos || "Nenhum arquivo",
          }
        ],

        footer: {
          text: `${data.repository.name} • ${new Date().toLocaleString("pt-BR")}`
        },

        url: commit.url,
        timestamp: new Date().toISOString()
      };

      await axios.post(process.env.DISCORD_WEBHOOK_URL, {
        embeds: [embed]
      });

    } catch (err) {
      console.error(err);
    }
}

  res.sendStatus(200);
});

// rota de teste
app.get("/", (req, res) => {
  res.send("Servidor rodando 👍");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Rodando"));