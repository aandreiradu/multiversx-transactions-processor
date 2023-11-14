export const TRANSACTIONS_SERVICE = 'MVX_TRANSACTIONS';

export const receiverCacheFormat = `receiver:{walletId}:coin:{coinType}:amount`;
export const senderCacheFormat = `sender:{walletId}:coin:{coinType}:amount`;

/**
 * 
 * const walletId = 123;
const coinType = 'EGLD';

// Fetch transaction amounts for the receiver (walletId) on the coin (EGLD)
const receiverKey = `receiver:${walletId}:coin:${coinType}:amount`;
const receivedAmounts = await customRedisService.get<number[]>(receiverKey);

// Calculate the total received amount for the wallet on EGLD
let totalReceivedAmount = 0;

if (receivedAmounts) {
  // Sum only the amounts received by the wallet
  totalReceivedAmount = receivedAmounts.reduce((acc, amount) => acc + amount, 0);
}

// Return the total received amount for the wallet on EGLD
return totalReceivedAmount;

 * 
 */
