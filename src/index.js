'use strict';

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import OrderbookWorker from 'worker-loader!./orderbook/worker';

import Orderbook from './orderbook/orderbook';
import { numberFormatter } from './helpers-common';

import './styles.scss';

class App extends Component {

  state = {
    asks: [],
    bids: [],
    currency: 'USD',
    message: '[no order selected]',
  };

  componentDidMount() {
    if (window.Worker) {
      this.ob = new OrderbookWorker();
      this.ob.onmessage = event => {

        let { asks, bids } = event.data;

        // Remove Infinite numbers
        asks = App.cleanData(asks);
        bids = App.cleanData(bids);

        // Data doesn't always arrive sorted so we sort by price
        // This needs to happen after the data is cleaned
        asks.sort((a, b) => a[0] - b[0]);
        bids.sort((a, b) => b[0] - a[0]);

        // Add cumulative and ids
        asks = App.populateData(asks);
        bids = App.populateData(bids);

        this.setState({asks, bids});

      };
    }
  }

  /**
   *
   * Remove Infinity and other irregular numbers
   * NOTE: Not sure if these numbers are bugs in the mocker or not
   *
   * @param {Array} data - bid or ask data as it arrives from the worker
   * @return {Array} a new array with irregular numbers removed
   *
   */
  static cleanData(data) {
    const newArray = [];
    for (const row of data) {
      if (Number(row[0]) === Infinity) {
        console.log(`Warning: Number is too big ${row[0]}. Ignoring`);
      }
      if (row[0] > 1000000) {
        console.log(`Warning: Price larger than 1000000 ${row[0]}. Ignoring`);
      }
      else {
        newArray.push(row);
      }
    }
    return newArray;
  }

  /**
   *
   * Generate cumulative and uid
   *
   * @param {Array} data - [price, amount]
   * @returns {Array} [price, amount, cumulative, uid]
   *
   */
  static populateData(data) {
    const list = [];
    let cumulativeNum = 0;
    for (const row of data) {
      cumulativeNum += row[1];
      const price = numberFormatter(row[0], 1);
      const amount = numberFormatter(row[1], 3);
      const cumulative = numberFormatter(cumulativeNum, 3);
      const uid = `${price}${amount}`;
      list.push([price, amount, cumulative, uid]);
    }
    return list;
  }

  clickHandler = ({type, amount, price}) => {
    const side = type === 'asks' ? 'Buy' : 'Sell';
    const message = `${side} ${amount} BTC at ${price} ${this.state.currency}`;
    this.setState(prevState => {
      return {
        ...prevState,
        message: message
      };
    });
  }

  render() {
    return (
      <div className="page-container">
        <Orderbook data={this.state} handleClick={this.clickHandler} />
        <div className="last-selected-order">
          Last selected Order<br />{this.state.message}
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
