'use strict';
// Pure fee calculation shared by the UI and verification script.
function waveFees(amount, taxPercent) {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 2) return null;
  const standard = amount * .01, creatorTax = amount * taxPercent / 100;
  const protocol = standard * .3;
  return {standard, creatorTax, total: standard + creatorTax, creator: standard * .5 + creatorTax, reserve: standard * .2, buyback: protocol * .8, infrastructure: protocol * .1, operations: protocol * .1};
}
if(typeof module !== 'undefined') module.exports={waveFees};
