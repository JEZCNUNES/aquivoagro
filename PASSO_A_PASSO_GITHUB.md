# 📋 Passo a Passo: Como Subir a Pasta "GIT PRONTO" para o GitHub

Esta pasta contém **exclusivamente os arquivos limpos e necessários** do projeto AgroArquivo, sem a pasta pesada `node_modules` nem arquivos temporários.

---

## 🟢 Opção 1: Automática (1 Clique no Windows)

1. Acesse [github.com/new](https://github.com/new) e crie um novo repositório:
   - **Repository name**: `agro-arquivo` (ou outro nome de sua preferência)
   - Escolha **Public** ou **Private**
   - **NÃO** marque as caixas de "Add a README file" nem ".gitignore" (pois já estão prontos aqui)
   - Clique em **Create repository**

2. Copie o link HTTPS do seu repositório criado (exemplo: `https://github.com/seu-usuario/agro-arquivo.git`).

3. Dê dois cliques no arquivo:
   ```cmd
   ENVIAR_PARA_O_GITHUB.bat
   ```

4. O terminal abrirá, comitará os arquivos e pedirá para colar o link do GitHub. Cole o link e pressione **ENTER**.

Pronto! Seus arquivos já estarão no GitHub! 🚀

---

## 💻 Opção 2: Pelo Terminal / Linha de Comando

Se preferir fazer pelo terminal (PowerShell, CMD ou Git Bash):

1. Abra o terminal dentro desta pasta `GIT PRONTO`:
   ```bash
   cd "c:\Users\Jezreel\Pictures\LSA AGRO\GIT PRONTO"
   ```

2. Inicialize o repositório Git:
   ```bash
   git init
   ```

3. Adicione todos os arquivos e crie o commit:
   ```bash
   git add .
   git commit -m "feat: AgroArquivo - Gestao Documental e Financeira Rural"
   ```

4. Defina a branch principal como `main`:
   ```bash
   git branch -M main
   ```

5. Conecte ao seu repositório no GitHub (substitua pelo seu link):
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/agro-arquivo.git
   ```

6. Envie os arquivos:
   ```bash
   git push -u origin main
   ```

---

## 🌐 Como Publicar o Site Online Gratuitamente

### Método 1: GitHub Pages (Já Configurado!)
O projeto já conta com o arquivo `.github/workflows/deploy.yml`.
Assim que você subir os arquivos para a branch `main`:
1. No seu repositório no GitHub, clique na aba **Settings** > **Pages**.
2. Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
3. O GitHub compilará e publicará o site online automaticamente!

### Método 2: Vercel (Deploy Rápido)
1. Acesse [vercel.com](https://vercel.com) e conecte com sua conta do GitHub.
2. Clique em **Add New...** > **Project**.
3. Selecione o repositório `agro-arquivo`.
4. Clique em **Deploy** (não precisa alterar nenhuma configuração).
5. Em menos de 1 minuto seu site estará no ar com link público HTTPS!
