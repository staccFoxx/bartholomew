import * as vscode from 'vscode';
import { activateUnifiedSuite } from './suiteCore';

export async function activate(context: vscode.ExtensionContext) {
  await activateUnifiedSuite(context);
}

export { activateUnifiedSuite };

export function deactivate() {
  console.log('[Bartholomew Trinity] Suite runtime deactivated.');
}
