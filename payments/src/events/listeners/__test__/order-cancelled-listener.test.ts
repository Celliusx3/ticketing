import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from "@cellius-tickets/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from '../order-cancelled-listener';
import { Order } from '../../../models/order';

const setup = async() => {
  // Create an instance for the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
 
  // Create and save an order
  const order = Order.build({
    id: orderId,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    price: 10
  });

  await order.save();

  // Create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
    }
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message =  {
    ack: jest.fn()
  }

  return {listener, order, data, msg}
};

it ('updates the status of the order', async () => {
  const {listener, order, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ticket is created
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it ('acks the message', async () => {
  const {listener, order, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});