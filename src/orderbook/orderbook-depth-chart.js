'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './orderbook-depth-chart.scss';
import { numberFormatter } from '../helpers-common';
import { drawLine, drawText, drawTriangle, drawShape } from '../helpers-canvas';

export default class OrderbookDepthChart extends Component {

  static propTypes = {
    asks: PropTypes.array,
    bids: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    activeY: PropTypes.number,
    medianPrice: PropTypes.string,
    activePrice: PropTypes.number,
    reservedWidth: PropTypes.number,
    handleMouseOut: PropTypes.func,
    handleMouseMove: PropTypes.func,
  };

  componentDidUpdate() {

    const { asks, bids, width, height, medianPrice, reservedWidth, activePrice, activeY } = this.props;
    const ctx = this.canvasRef.current.getContext('2d');

    const ctxAxis = this.canvasAxisRef.current.getContext('2d');

    const halfHeight = height / 2;
    const tickLength = 5;
    const tickTextSpace = 15;

    // An optimization may be that we don't clear the full canvas each update
    ctx.clearRect(0, 0, width, height);

    // Draw vertical divider line
    drawLine(ctx, [reservedWidth, 0], [reservedWidth, height], {color: '#555'});

    // Draw horizontal fair price line
    drawLine(ctx, [reservedWidth, halfHeight], [width, halfHeight], {color: '#555'});

    // Draw horizontal tick
    drawLine(ctx, [reservedWidth - tickLength, halfHeight], [reservedWidth, halfHeight], {
      color: '#555', dashed: [], lineWidth: 3
    });

    // Draw median price text if mouse is not over the midline area
    const hideHeight = 40;
    if (
      (activeY < (halfHeight - hideHeight)) ||
      (activeY > (halfHeight + hideHeight))) {
      drawText(ctx, medianPrice, [reservedWidth - tickTextSpace, halfHeight], {color: '#555'});
    }

    // Draw asks
    if (asks.length > 1) {
      const asksCoordinates = this.getCoordinates('asks', width);
      drawShape(ctx, asksCoordinates, {color: '#990000', fillOpacity: '22'});
    }

    // Draw bids
    if (bids.length > 1) {
      const bidsCoordinates = this.getCoordinates('bids', width, height);
      drawShape(ctx, bidsCoordinates, {color: '#00AA33', fillOpacity: '22'});
    }

    ctxAxis.clearRect(0, 0, width, height);
    if (activeY !== null) {

      // Draw active price text
      ctxAxis.clearRect(0, 0, width, height);

      // Draw text
      const formattedActivePrice = numberFormatter(activePrice, 1);
      drawText(ctxAxis, formattedActivePrice, [reservedWidth - tickTextSpace, activeY], '#fff');

      // Draw masks
      ctx.fillStyle = '#00000080';
      if (activeY < halfHeight) {
        ctx.fillRect(reservedWidth + 1, 0, width, activeY);
        ctx.fillRect(reservedWidth + 1, halfHeight + 1, width, halfHeight);
      }
      else if (activeY > halfHeight) {
        ctx.fillRect(reservedWidth + 1, activeY, width, halfHeight);
        ctx.fillRect(reservedWidth + 1, 0, width - 1, halfHeight);
      }

      // Draw horizontal hover line
      drawLine(ctxAxis, [reservedWidth, activeY], [width, activeY], {color: '#970', dashed: [5, 5]});

      // Draw triangle
      const targetXY = [reservedWidth - 2, activeY];
      drawTriangle(ctxAxis, targetXY, 5, 10, {color: '#970'});
    }


  }

  getCoordinates(type, width, height) {

    const data = this.props[type];
    const coordinates = [];

    for (let i = 0; i < data.length; i++) {

      if (i === data.length - 1) {
        if (type === 'bids') {
          coordinates.push([data[i][0], height]);
        }
        continue;
      }

      const firstX = data[i][0];
      const firstY = data[i][1];
      const secondX = data[i + 1][0];
      const secondY = data[i + 1][1];

      if (i === 0) {
        coordinates.push([width, -1])
        coordinates.push([width, firstY]);
        coordinates.push([firstX, firstY]);
      }
      coordinates.push([firstX, secondY]);
      coordinates.push([secondX, secondY]);

    }

    if (type === 'asks') {
      const finalX = coordinates[coordinates.length - 1][0];
      const finalY = -1;
      coordinates.push([finalX, finalY]);
    }
    else {
      const finalX = coordinates[0][0];
      const finalY = coordinates[coordinates.length - 1][1];
      coordinates.push([finalX, finalY]);
    }

    return coordinates;

  }

  render() {
    const { width, height } = this.props;
    const style = {
      width: width / 2,
      height: height / 2
    };
    this.canvasRef = React.createRef();
    this.canvasAxisRef = React.createRef();
    return (
      <div className="orderbook-depth-chart">
        <canvas
          className="canvas-axis"
          style={style}
          ref={this.canvasAxisRef}
          width={width}
          height={height}
          onMouseOut={this.props.handleMouseOut}
          onMouseMove={this.props.handleMouseMove} />
        <canvas ref={this.canvasRef} width={width} height={height} style={style} />
      </div>
    );
  }
}
