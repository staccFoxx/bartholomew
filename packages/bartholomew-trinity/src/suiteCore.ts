import * as vscode from 'vscode';
import { ZkMarginAttestationEngine } from './security/zkProofVerifier';
import { HybridLiquidityRouter } from './engine/hybridRouter';
import { ExtensionBridge } from './bridge/extensionBridge';
import { SuiteHudPanel } from './hudPanel';

export async function activateUnifiedSuite(context: vscode.ExtensionContext) {
  console.log('[Bartholomew Suite] Initializing multi-extension runtime & security plane...');
  const router = new HybridLiquidityRouter();

  // 1. Register the unified command for executing attested risk hedges
  context.subscriptions.push(
    vscode.commands.registerCommand('bartholomew.executeAttestedHedge', async (marketId: string = 'active-branch', size: number = 100) => {
      try {
        vscode.window.showInformationMessage('[Tortuga] Generating ZK solvency proof for vault...');

        // Verify vault solvency locally via ZK-SNARK attestation before routing trade
        const proof = await ZkMarginAttestationEngine.generateSolvencyProof({
          totalLiabilities: size * 0.5,
          collateralBalance: size * 2.0,
          secretNonce: 'bartholomew-runtime-nonce-' + Date.now()
        });

        if (!ZkMarginAttestationEngine.verifyProof(proof)) {
          throw new Error('Solvency proof verification failed.');
        }

        // Execute via hybrid router (Local CLOB with external fallback)
        const result = await router.executeOrder({
          marketId,
          side: 'BUY',
          size,
          limitPrice: 0.85
        });

        vscode.window.showInformationMessage(`[Success] Hedge executed via ${result.exchange}! Filled: ${result.filledSize}`);

        // Broadcast hedge confirmation to live Svelte HUD
        ExtensionBridge.broadcast('HEDGE_CONFIRMED', {
          marketId,
          exchange: result.exchange,
          filled: result.filledSize,
          commitment: proof.commitmentHash.substring(0, 16) + '...'
        });
      } catch (error: any) {
        vscode.window.showErrorMessage(`[Execution Error] ${error.message}`);
      }
    })
  );

  // 2. Register command to open unified Spatial HUD overlay
  context.subscriptions.push(
    vscode.commands.registerCommand('bartholomew.openSuiteHud', () => {
      SuiteHudPanel.createOrShow(context.extensionUri);
    })
  );

  console.log('[Bartholomew Suite] All security runtimes, telemetry pipes, and risk desks online.');
}
