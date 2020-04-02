'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { scaleLinear } from 'd3-scale'
import { max, median } from 'd3-array'

import OrderbookList from './orderbook-list';
import OrderbookDepthChart from './orderbook-depth-chart';
import { numberFormatter, diffNumericStrings } from '../helpers-common';

export default class Orderbook extends Component {

  static propTypes = {
    data: PropTypes.object,
    handleClick: PropTypes.func,
  };

  state = {
    orderbook: {
      asks: [],
      bids: [],
      currency: 'USD',
      fairPrice: null,
      activeAsk: null,
      activeBid: null,
    },
    depthChart: {
      asks: [],
      bids: [],
      width: 460,
      height: 900,
      xScale: null,
      yScale: null,
      activeY: null,
      medianPrice: null,
      activePrice: null,
      accumulation: null,
      reservedWidth: 120 // reserved space for text
    }
  };

  componentDidUpdate(prevProps) {

    const { asks = [], bids = [] } = this.props.data;

    if ((prevProps.data === this.props.data) || (!asks.length || !bids.length)) {
      return;
    }

    // Fair Price Model
    const fairPrice = Orderbook.getFairPriceModel({asks, bids});

    // Orderbook Model
    const orderbook = Orderbook.getOrderbookModel({asks, bids});

    // Depth Chart Model
    const { width, height, reservedWidth } = this.state.depthChart;
    const depthChart = Orderbook.getDepthChartModel({asks, bids}, width, height, reservedWidth);

    // Updating with a function as setState is asynchronous
    this.setState(prevState => {
      return {
        ...prevState,
        orderbook: {
          ...prevState.orderbook,
          fairPrice,
          asks: orderbook.asks,
          bids: orderbook.bids,
        },
        depthChart: {
          ...prevState.depthChart,
          asks: depthChart.asks,
          bids: depthChart.bids,
          xScale: depthChart.xScale,
          yScale: depthChart.yScale,
          medianPrice: depthChart.medianPrice
        }
      };
    });

  }

  /**
   *
   * @param {Object} {asks, bids} - an object with "asks" and "bids" arrays
   * @returns {String} a formated price string
   *
   */
  static getFairPriceModel({asks, bids}) {
    const num = (Number(asks[0][0]) + Number(bids[0][0])) / 2;
    const fairPrice = numberFormatter(num, 1);
    return fairPrice;
  }

  /**
   *
   * Build Orderbook model
   *
   * @param {Object} {asks, bids} - an object with "asks" and "bids" arrays
   * @returns {Object} an object with "asks" and "bids" arrays
   *
   */
  static getOrderbookModel(data) {
    const result = {};
    for (const side of ['bids', 'asks']) {
      const list = [];
      let previousPrice = '';
      for (const row of data[side]) {
        const price = numberFormatter(row[0], 1);
        const priceArray = diffNumericStrings(previousPrice, price);
        previousPrice = price;
        list.push([priceArray, row[1], row[2], row[3]]);
      }
      result[side] = list;
    }
    return result;
  }

  /**
   *
   * Build Depth Chart model
   *
   * @param {Object} {asks, bids} - an object with "asks" and "bids" arrays
   * @param {Number} width - the width of the depth chart
   * @param {Number} height - the height of the depth chart
   * @param {Number} reservedWidth - the width of the text area to the left of the chart
   * @returns {Object} an object with "asks", "bids" and other properties
   *
   */
  static getDepthChartModel(data, width, height, reservedWidth) {

    const { asks, bids } = data;

    const askList = [];
    for (const row of asks) {
      askList.push([Number(row[2]), Number(row[0])]);
    }

    const bidList = [];
    for (const row of bids) {
      bidList.push([Number(row[2]), Number(row[0])]);
    }

    // Accumulation
    // Need to get the min and max of the aggregated ask/bid accumulation
    const fullArray = [...bidList, ...askList];
    const xMin = 0;
    const xMax = Number(max(fullArray, x => x[0]));

    // MidPrice
    const medianPrice = numberFormatter(median(fullArray, x => x[1]), 1);

    // Price
    // Depending on the data we may or may not be able to do this shortcut
    // We may have to get the xMin and xMax of the full array as we do for y
    const aLst = askList.length - 1;
    const bLst = bidList.length - 1;
    const yMin = Math.min(askList[0][1], bidList[bLst][1]);
    const yMax = Math.max(askList[aLst][1], bidList[0][1]);

    const xScale = scaleLinear()
      .domain([xMin, xMax])
      .rangeRound([width, reservedWidth]);

    const yScale = scaleLinear()
      .domain([yMin, yMax])
      .rangeRound([height, 0]);

    const scaledAsks = [];
    for (const tick of askList) {
      scaledAsks.push([
        xScale(tick[0]),
        yScale(tick[1])
      ]);
    }

    const scaledBids = [];
    for (const tick of bidList) {
      scaledBids.push([
        xScale(tick[0]),
        yScale(tick[1])
      ]);
    }

    return {
      asks: scaledAsks,
      bids: scaledBids,
      medianPrice,
      xScale,
      yScale
    }

  }

  handleMouseOverOrderbook = ({type, uid}) => {
    const cumulative = this.state.orderbook[type].find(x => x[3] === uid)[2];
    const counterpart = this.state.orderbook[type === 'bids' ? 'asks' : 'bids'];
    let counterpartIndex = '';
    for (const item of counterpart) {
      if (Number(cumulative) < Number(item[2])) {
        counterpartIndex = String(item[3]);
        break;
      }
    }
    let activeAsk;
    let activeBid;
    if (type === 'asks') {
      activeAsk = uid;
      activeBid = counterpartIndex;
    }
    else {
      activeAsk = counterpartIndex;
      activeBid = uid;
    }
    this.setState(prevState => {
      return {
        ...prevState,
        orderbook: {
          ...prevState.orderbook,
          activeAsk,
          activeBid
        }
      };
    });
  };

  handleMouseOutOrderbook = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        orderbook: {
          ...prevState.orderbook,
          activeAsk: '',
          activeBid: ''
        }
      };
    });
  };

  updateMouseOverDepthChart = (activePrice, accumulation, activeY) => {
    this.setState(prevState => {
      return {
        ...prevState,
        depthChart: {
          ...prevState.depthChart,
          accumulation,
          activePrice,
          activeY
        }
      };
    });
  }

  handleMouseMoveDepthChart = event => {
    if (!this.state.depthChart.xScale) {
      return;
    }
    const { yScale, xScale } = this.state.depthChart;
    const mouseX = (event.clientX - event.target.offsetLeft) * 2;
    const mouseY = (event.clientY - event.target.offsetTop) * 2;
    const price = yScale.invert(mouseY);
    const accumulation = xScale.invert(mouseX);
    this.updateMouseOverDepthChart(price, accumulation, mouseY);
  }

  handleMouseOutDepthChart = () => {
    this.updateMouseOverDepthChart(null, null, null);
  }

  render() {

    const { depthChart:dc, orderbook:ob } = this.state;

    if (!this.props.data.asks.length) {
      return (<div>loading...</div>)
    }
    else {
      return (
        <div className="components-container">
          <OrderbookDepthChart
            asks={dc.asks}
            bids={dc.bids}
            width={dc.width}
            height={dc.height}
            medianPrice={dc.medianPrice}
            accumulation={dc.accumulation}
            activePrice={dc.activePrice}
            activeY={dc.activeY}
            handleMouseMove={this.handleMouseMoveDepthChart}
            handleMouseOut={this.handleMouseOutDepthChart}
            reservedWidth={dc.reservedWidth} />
          <OrderbookList
            asks={ob.asks}
            bids={ob.bids}
            currency={ob.currency}
            fairPrice={ob.fairPrice}
            activeAsk={ob.activeAsk}
            activeBid={ob.activeBid}
            handleClick={this.props.handleClick}
            handleMouseOver={this.handleMouseOverOrderbook}
            handleMouseOut={this.handleMouseOutOrderbook} />
        </div>
      )
    }
  }

}
