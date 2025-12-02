// src/desktop/main.ts
import { app, BrowserWindow, session } from "electron";
import path from "path";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false, // покажем только когда загрузится
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = process.env.NODE_ENV === "development";

  // Грузим Vite-дев сервер
  mainWindow.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../client/index.html")}`
  );

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Открываем DevTools в dev-режиме (удобно)
  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow?.webContents.openDevTools({ mode: "detach" });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
