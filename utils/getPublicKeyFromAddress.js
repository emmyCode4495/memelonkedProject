import { PublicKey } from '@solana/web3.js';
import { toUint8Array } from 'js-base64';

export function getPublicKeyFromAddress(address) {
  return new PublicKey(toUint8Array(address));
}
