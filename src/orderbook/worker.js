/* global postMessage */

const orders = 15;
const getAmount = () => Math.floor(Math.random() * 10 + 1) + Math.random();
const randomNumber = (min = 0, max = 1) =>
  Math.floor(Math.random() * (max - min) + min);

const initializeOrderbook = () => {
  const orderbook = { asks: [], bids: [] };
  const startPrice = 4000;

  for (let i = 0; i < orders; i += 1) {
    const bid = startPrice - i + Math.random();
    const ask = startPrice + i + Math.random();

    orderbook.asks.push([ask, getAmount()]);
    orderbook.bids.push([bid, getAmount()]);
  }

  postMessage(orderbook);

  return orderbook;
};

const run = orderbook => {
  let tradeCount = 0;
  return setInterval(() => {
    const randomRange = randomNumber(0, 10);

    for (let i = 0; i < randomRange; i += 1) {
      tradeCount = tradeCount + 1;
      const askPosition = randomNumber(0, orders);
      const bidPosition = randomNumber(0, orders);
      const ask = orderbook.asks[askPosition][0] + (i % 2);
      const bid = orderbook.bids[bidPosition][0] - (i % 2);

      const exponentiate = tradeCount === 50;

      orderbook.asks[askPosition] = [
        exponentiate ? parseFloat(ask).toExponential() : ask,
        getAmount(),
      ];
      orderbook.bids[bidPosition] = [
        exponentiate ? parseFloat(bid).toExponential() : bid,
        getAmount(),
      ];
    }

    postMessage(orderbook);
  }, 700);
};

run(initializeOrderbook());
