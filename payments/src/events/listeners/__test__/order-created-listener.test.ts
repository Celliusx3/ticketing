import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from "@cellius-tickets/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from '../order-created-listener';
import { Order } from '../../../models/order';

const setup = async() => {
  // Create an instance for the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 10
    }
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message =  {
    ack: jest.fn()
  }

  return {listener, data, msg}
};

it ('replicates the order info', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ticket is created
  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it ('acks the message', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ack is called
  expect(msg.ack).toHaveBeenCalled();

});