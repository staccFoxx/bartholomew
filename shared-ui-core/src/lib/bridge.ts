// Safe VS Code API acquisition with automatic fallback for local browser testing
declare const acquireVsCodeApi: any;

const getVsCodeApi = () => {
  if (typeof acquireVsCodeApi === 'function') {
    return acquireVsCodeApi();
  }
  return {
    postMessage: (msg: any) => console.log('[Dev Mode] postMessage:', msg),
    getState: () => ({}),
    setState: (state: any) => {}
  };
};

const vscode = getVsCodeApi();

export function sendToExtension(command: string, payload?: any) {
  try {
    vscode.postMessage({ command, payload });
  } catch (err) {
    console.error(`Failed to dispatch command "${command}":`, err);
  }
}

// Alias for backwards compatibility
export const dispatchAction = sendToExtension;

export function createMessageListener(onMessage: (command: string, payload: any) => void): () => void {
  const handler = (event: MessageEvent) => {
    const data = event.data;
    if (data && typeof data === 'object') {
      const command = data.command || data.type;
      const payload = data.payload !== undefined ? data.payload : data;
      if (command) {
        onMessage(command, payload);
      }
    }
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}
