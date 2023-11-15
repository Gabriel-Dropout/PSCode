// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Extension PSCode activated.');

	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.activate', () => {
			vscode.window.showInformationMessage('Activate PSCode');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.deactivate', () => {
			vscode.window.showInformationMessage('Dectivate PSCode');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.compile', () => {
			vscode.window.showInformationMessage('Compile');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.test', () => {
			vscode.window.showInformationMessage('Test');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.new', () => {
			vscode.window.showInformationMessage('new problem');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.panic', () => {
			vscode.window.showInformationMessage('give up problem');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.focus', () => {
			vscode.window.showInformationMessage('focus mode on');
	}));
	context.subscriptions.push(
		vscode.commands.registerCommand('pscode.distract', () => {
			vscode.window.showInformationMessage('focus mode off');
	}));


	// Register webview providers
	// known as 'sidebar'
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("pscode.testcase",
		{ 
			resolveWebviewView: function(thisWebview: vscode.WebviewView, thisWebviewContext: vscode.WebviewViewResolveContext, thisToken: vscode.CancellationToken){
				thisWebview.webview.options={enableScripts:true};
				thisWebview.webview.html=`<!DOCTYPE html>
				<html>
					<body>
						<h1>Test case</h1>
						<p>This is test case view</p>
						
					</body>
				</html>`;
			}
		}
		)
	);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("pscode.compile",
		{ 
			resolveWebviewView: function(thisWebview: vscode.WebviewView, thisWebviewContext: vscode.WebviewViewResolveContext, thisToken: vscode.CancellationToken){
				thisWebview.webview.options={enableScripts:true};
				thisWebview.webview.html=`<!DOCTYPE html>
				<html>
					<body>
						<h1>Compile</h1>
						<p>Do you want to compile?</p>
						<button>Yes</button>
					</body>
				</html>`;
			}
		}
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
