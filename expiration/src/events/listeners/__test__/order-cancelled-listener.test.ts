import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent, OrderStatus } from "@cellius-tickets/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async() => {
  // Create an instance for the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
 
  // Create and save a ticket
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 99,
  })
  ticket.set({ orderId });

  await ticket.save();

  // Create a fake data event
  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
        id: ticket.id,
    }
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message =  {
    ack: jest.fn()
  }

  return {listener, ticket, data, msg}
};

it ('updates the ticket, publishes an event, and acks the message', async () => {
  const {listener, ticket, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ticket is created
  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  expect(msg.ack).toHaveBeenCalled();
});