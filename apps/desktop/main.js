"use strict";
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    const devServerUrl =
      process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    const indexHtml = path.join(process.resourcesPath, "dist", "index.html");
    mainWindow.loadFile(indexHtml);
  }

  return mainWindow;
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

