import { Message } from 'node-nats-streaming';
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { TicketUpdatedEvent } from '@cellius-tickets/common';

const setup = async() => {
  // Create an instance for the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  })

  await ticket.save();

  // Create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'new concert',
    price: 999,
    userId:new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message =  {
    ack: jest.fn()
  }

  return { listener, data, msg, ticket }
};

it ('finds, updates and saves a ticket', async () => {
  const {listener, data, msg, ticket} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ticket is updated
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it ('acks the message', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ack is called
  expect(msg.ack).toHaveBeenCalled();

});

it ('does not call ack if the event has a skipped version number', async () => {
  const {listener, data, msg, ticket} = await setup();

  data.version = 10;
  
  // Call the onMessage function data object + message object
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();

});