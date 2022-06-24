import { Message } from 'node-nats-streaming';
import { OrderCreatedEvent, OrderStatus } from "@cellius-tickets/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import { OrderCreatedListener } from '../order-created-listener';

const setup = async() => {
  // Create an instance for the listener
  const listener = new OrderCreatedListener(natsWrapper.client);
 
  // Create and save a ticket
  const ticket = Ticket.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 99,
  })

  await ticket.save();

  // Create a fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
        id: ticket.id,
        price: ticket.price
    }
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message =  {
    ack: jest.fn()
  }

  return {listener, ticket, data, msg}
};

it ('sets the orderId of the ticket', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ticket is created
  const updatedTicket = await Ticket.findById(data.ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it ('acks the message', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ack is called
  expect(msg.ack).toHaveBeenCalled();

});

it ('publishes a ticket updated event', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ack is called
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});