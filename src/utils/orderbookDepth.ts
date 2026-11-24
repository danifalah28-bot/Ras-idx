import type { StockRecord } from '../types/market';
import { roundIdxTick } from '../data/idxUniverse';

export interface DepthLevel {
  price: number;
  lot: number;
  cumLot: number;
}

export interface OrderbookDepthSnapshot {
  levelsCount: number;
  bids: DepthLevel[];
  asks: DepthLevel[];
  spread: number;
  spreadPct: number;
  totalBidLot: number;
  totalOfferLot: number;
  buyPressurePct: number;
  bidWall: DepthLevel;
  offerWall: DepthLevel;
  maxLevelLot: number;
}

/** Official BEI Peraturan Nomor II-A Price Tick Fractions */
export function getIdxTickSize(price: number): number {
  if (price < 200) return 1;
  if (price < 500) return 2;
  if (price < 2000) return 5;
  if (price < 5000) return 10;
  return 25;
}

export function stepUpIdxTick(price: number): number {
  return price + getIdxTickSize(price);
}

export function stepDownIdxTick(price: number): number {
  const candidate = price - 1;
  return Math.max(1, price - getIdxTickSize(candidate));
}

export function buildOrderbookDepth(
  stock: StockRecord,
  levelsCount = 10
): OrderbookDepthSnapshot {
  const bestBid = roundIdxTick(stock.price);
  const bestOffer = stepUpIdxTick(bestBid);
  const baseLot = Math.max(
    100,
    Math.round((stock.adtvB * 1000) / Math.max(1, stock.price))
  );
  const bidBias = Math.max(0.25, stock.bidVolumeRatio / 50);
  const offerBias = Math.max(0.25, (100 - stock.bidVolumeRatio) / 50);

  let hash = 0;
  for (let i = 0; i < stock.ticker.length; i++) {
    hash = (hash * 31 + stock.ticker.charCodeAt(i)) % 997;
  }

  const bids: DepthLevel[] = [];
  const asks: DepthLevel[] = [];

  let currentBid = bestBid;
  let currentAsk = bestOffer;
  let cumBid = 0;
  let cumAsk = 0;

  for (let i = 0; i < levelsCount; i++) {
    // Deterministic level lot profile calibrated to ADTV & orderbook imbalance with natural wall clustering
    const bidCluster = (hash + i * 17) % 11 === 0 ? 1.85 : 1;
    const offerCluster = (hash + i * 23) % 13 === 0 ? 1.85 : 1;

    const bidLot = Math.max(
      10,
      Math.round(
        baseLot *
          bidBias *
          bidCluster *
          (0.42 + ((hash + i * 17) % 10) * 0.13) *
          Math.max(0.32, 1 - i * 0.042)
      )
    );
    const offerLot = Math.max(
      10,
      Math.round(
        baseLot *
          offerBias *
          offerCluster *
          (0.42 + ((hash + i * 23) % 10) * 0.13) *
          Math.max(0.32, 1 - i * 0.042)
      )
    );

    cumBid += bidLot;
    cumAsk += offerLot;

    bids.push({ price: currentBid, lot: bidLot, cumLot: cumBid });
    asks.push({ price: currentAsk, lot: offerLot, cumLot: cumAsk });

    currentBid = stepDownIdxTick(currentBid);
    currentAsk = stepUpIdxTick(currentAsk);
  }

  const spread = Math.max(1, bestOffer - bestBid);
  const spreadPct = (spread / Math.max(1, bestBid)) * 100;
  const totalBidLot = cumBid;
  const totalOfferLot = cumAsk;
  const buyPressurePct =
    totalBidLot + totalOfferLot > 0
      ? Math.round((totalBidLot / (totalBidLot + totalOfferLot)) * 100)
      : stock.bidVolumeRatio;

  let bidWall = bids[0];
  let offerWall = asks[0];
  let maxLevelLot = 1;

  for (let i = 0; i < levelsCount; i++) {
    if (bids[i].lot > bidWall.lot) bidWall = bids[i];
    if (asks[i].lot > offerWall.lot) offerWall = asks[i];
    maxLevelLot = Math.max(maxLevelLot, bids[i].lot, asks[i].lot);
  }

  return {
    levelsCount,
    bids,
    asks,
    spread,
    spreadPct,
    totalBidLot,
    totalOfferLot,
    buyPressurePct,
    bidWall,
    offerWall,
    maxLevelLot,
  };
}
