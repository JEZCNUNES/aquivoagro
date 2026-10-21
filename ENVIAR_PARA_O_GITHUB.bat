@echo off
setlocal
TITLE Enviar AgroArquivo para o GitHub

echo =======================================================
echo          ENVIAR AGROARQUIVO PARA O GITHUB
echo =======================================================
echo.

WHERE git >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] O Git nao foi encontrado no seu computador.
    echo Baixe e instale o Git em: https://git-scm.com/
    pause
    exit /b 1
)

echo [1/5] Inicializando repositorio Git local...
if not exist ".git\" (
    git init
)

echo.
echo [2/5] Adicionando arquivos do projeto...
git add .

echo.
echo [3/5] Criando o primeiro commit...
git commit -m "feat: AgroArquivo - Gestao Documental e Financeira do Produtor Rural"

echo.
echo [4/5] Definindo a branch principal como 'main'...
git branch -M main

echo.
echo =======================================================
echo Agora cole o link do seu repositorio criado no GitHub:
echo Exemplo: https://github.com/SEU-USUARIO/agro-arquivo.git
echo =======================================================
echo.
set /p REPO_URL="Cole o link do repositorio aqui e pressione ENTER: "

if "%REPO_URL%"=="" (
    echo [AVISO] Nenhum link informado.
    echo Os arquivos ja estao commitados localmente.
    echo Quando tiver o link, use:
    echo   git remote add origin SEU_LINK
    echo   git push -u origin main
    pause
    exit /b 0
)

echo.
echo [5/5] Conectando ao GitHub e enviando arquivos...
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo =======================================================
    echo   SUCESSO! O AgroArquivo foi enviado para o GitHub!
    echo =======================================================
) else (
    echo =======================================================
    echo Se pediu login/senha ou token, autentique no navegador.
    echo Caso queira tentar novamente, execute este arquivo.
    echo =======================================================
)

pause
endlocal
