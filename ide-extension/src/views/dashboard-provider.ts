/**
 * Dashboard WebView Provider
 * Issue #111: WebView Dashboard
 */

import * as vscode from 'vscode';

export class DashboardProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'prismcode.dashboard';

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PrismCode Dashboard</title>
    <style>
        body {
            padding: 10px;
            color: var(--vscode-foreground);
            font-family: var(--vscode-font-family);
        }
        h1 {
            font-size: 20px;
            margin-bottom: 10px;
        }
        .status {
            background: var(--vscode-editor-background);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }
        button {
            width: 100%;
            padding: 8px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 5px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <h1>🚀 PrismCode</h1>
    
    <div class="status">
        <h3>Quick Stats</h3>
        <div class="metric">
            <span>Agents:</span>
            <span>5 Active</span>
        </div>
        <div class="metric">
            <span>Status:</span>
            <span>Ready</span>
        </div>
    </div>

    <button onclick="generatePlan()">Generate Plan</button>
    <button onclick="createIssues()">Create Issues</button>
    <button onclick="viewLogs()">View Logs</button>

    <script>
        const vscode = acquireVsCodeApi();

        function generatePlan() {
            vscode.postMessage({ command: 'generatePlan' });
        }

        function createIssues() {
            vscode.postMessage({ command: 'createIssues' });
        }

        function viewLogs() {
            vscode.postMessage({ command: 'viewLogs' });
        }
    </script>
</body>
</html>`;
    }
}
