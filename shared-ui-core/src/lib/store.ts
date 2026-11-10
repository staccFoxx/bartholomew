import { writable } from 'svelte/store';

export interface SuiteTelemetry {
  guardStatus: 'nominal' | 'violation-detected';
  activeSpend: number;
  spendLimit: number;
  vaultTokensMasked: number;
  marketConfidence: number;
  opticalEnergyFj: number;
  promptEfficiencyGain: number;
  voiceShieldStatus: 'secured' | 'bypassed';
}

export const suiteState = writable<SuiteTelemetry>({
  guardStatus: 'nominal',
  activeSpend: 420.50,
  spendLimit: 1000.00,
  vaultTokensMasked: 1420,
  marketConfidence: 0.742,
  opticalEnergyFj: 0.85,
  promptEfficiencyGain: 35.0,
  voiceShieldStatus: 'secured'
});

export function updateGuardStatus(status: 'nominal' | 'violation-detected') {
  suiteState.update(s => ({ ...s, guardStatus: status }));
}

export function updateSpend(active: number, limit?: number) {
  suiteState.update(s => ({
    ...s,
    activeSpend: active,
    spendLimit: limit !== undefined ? limit : s.spendLimit
  }));
}

export function updateConfidence(conf: number) {
  suiteState.update(s => ({ ...s, marketConfidence: conf }));
}

export function updateVaultTokens(tokens: number) {
  suiteState.update(s => ({ ...s, vaultTokensMasked: tokens }));
}

export function updateOpticalTelemetry(energyFj: number) {
  suiteState.update(s => ({ ...s, opticalEnergyFj: energyFj }));
}

export function updateVoiceShield(status: 'secured' | 'bypassed') {
  suiteState.update(s => ({ ...s, voiceShieldStatus: status }));
}
