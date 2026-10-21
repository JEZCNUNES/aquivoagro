@echo off
setlocal
TITLE Iniciar AgroArquivo

echo ===================================================
echo      INICIANDO AGROARQUIVO LOCALMENTE
echo ===================================================
echo.

WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao foi encontrado no sistema.
    echo Baixe e instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] Instalando dependencias necessarias...
    call npm install
)

echo.
echo [INFO] Iniciando servidor local...
echo [INFO] Acesse no navegador: http://localhost:5173/
echo.
call npm run dev -- --open

endlocal
