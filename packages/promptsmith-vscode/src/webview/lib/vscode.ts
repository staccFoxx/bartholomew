// Acquire VS Code webview API safely
declare const acquireVsCodeApi: any;

const vsCode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : {
  postMessage: (msg: any) => console.log('Mock postMessage:', msg),
  setState: (state: any) => {},
  getState: () => ({})
};

export interface UIAction {
  command: string;
  payload?: any;
}

export function dispatchAction(command: string, payload?: any) {
  vsCode.postMessage({ command, payload });
}
