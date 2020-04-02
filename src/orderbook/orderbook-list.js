'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './orderbook-list.scss';

class OrderListItem extends Component {

  static propTypes = {
    uid: PropTypes.string,
    type: PropTypes.string,
    price: PropTypes.array,
    amount: PropTypes.string,
    active: PropTypes.bool,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    cumulative: PropTypes.string,
    handleClick: PropTypes.func,
    handleMouseOver: PropTypes.func,
  };

  handleMouseOver = () => {
    const { type, uid } = this.props;
    this.props.handleMouseOver({type, uid});
  };

  handleClick = () => {
    const type = this.props.type;
    const amount = this.props.amount;
    const price = Number(this.props.price.join(''));
    this.props.handleClick({type, amount, price});
  };

  render() {
    const classList = [
      'order-list-item',
      ...[this.props.active ? 'order-list-item-active' : undefined]
    ].join(' ');
    const [pricePrefix, priceSuffix] = this.props.price;
    const [amountPrefix, amountSuffix] = this.props.amount.split('.');
    const [cumulativePrefix, cumulativeSuffix] = this.props.cumulative.split('.');
    return (
      <li className={classList} onMouseOver={this.handleMouseOver} onClick={this.handleClick}>
        <Price prefix={pricePrefix} suffix={priceSuffix} />
        <OrderAmount prefix={amountPrefix} suffix={amountSuffix} />
        <OrderAmount prefix={cumulativePrefix} suffix={cumulativeSuffix} />
      </li>
    );
  }

}

class OrderList extends Component {

  static propTypes = {
    type: PropTypes.string,
    data: PropTypes.array,
    activeIndex: PropTypes.string,
    handleClick: PropTypes.func,
    handleMouseOver: PropTypes.func,
  };

  render() {
    const classList = [
      'order-list',
      `order-list-${this.props.type}`
    ].join(' ');
    const type = this.props.type;
    const listItems = this.props.data.map(([price, amount, cumulative, uid], idx) => (
      <OrderListItem
        key={idx}
        uid={uid}
        type={type}
        price={price}
        amount={amount}
        active={uid === this.props.activeIndex}
        cumulative={cumulative}
        handleClick={this.props.handleClick}
        handleMouseOver={this.props.handleMouseOver}
      />
    ));
    return (
      <ol className={classList}>
        {listItems}
      </ol>
    );
  }
}

const FairPrice = ({value, currency}) => {
  return (
    <div className="fair-price">
      <div>{value} {value ? currency : ''}</div>
    </div>
  );
};

const Price = ({prefix, suffix}) => {
  return (
    <span className="price">
      <span className="lite">{prefix}</span>
      <span>{suffix}</span>
    </span>
  );
}

const OrderAmount = ({prefix, suffix}) => {
  return (
    <span className="order-amount">
      <span>{prefix}.</span>
      <span className="lite">{suffix}</span>
    </span>
  );
}

FairPrice.propTypes = {
  value: PropTypes.string,
  currency: PropTypes.string,
};

OrderAmount.propTypes = {
  prefix: PropTypes.string,
  suffix: PropTypes.string,
};

Price.propTypes = {
  prefix: PropTypes.string,
  suffix: PropTypes.string,
};

export default class Orderbook extends Component {

  static propTypes = {
    asks: PropTypes.array,
    bids: PropTypes.array,
    currency: PropTypes.string,
    type: PropTypes.string,
    data: PropTypes.array,
    activeAsk: PropTypes.string,
    activeBid: PropTypes.string,
    fairPrice: PropTypes.string,
    activeIndex: PropTypes.string,
    handleClick: PropTypes.func,
    handleMouseOut: PropTypes.func,
    handleMouseOver: PropTypes.func,
  };

  render() {
    return (
      <div className="orderbook-list" onMouseOut={this.props.handleMouseOut}>
        <FairPrice
          value={this.props.fairPrice}
          currency={this.props.currency} />
        <OrderList
          type="asks"
          data={this.props.asks}
          activeIndex={this.props.activeAsk}
          handleClick={this.props.handleClick}
          handleMouseOver={this.props.handleMouseOver} />
        <OrderList
          type="bids"
          data={this.props.bids}
          activeIndex={this.props.activeBid}
          handleClick={this.props.handleClick}
          handleMouseOver={this.props.handleMouseOver} />
      </div>
    );
  }
}
