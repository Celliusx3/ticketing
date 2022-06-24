import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from "@cellius-tickets/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import { Ticket } from '../../../models/ticket';

const setup = async() => {
  // Create an instance for the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // Create a fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId:new mongoose.Types.ObjectId().toHexString(),
  };

  // Create a fake message object
  // @ts-ignore
  const msg: Message =  {
    ack: jest.fn()
  }

  return {listener, data, msg}
};

it ('creates and saves a ticket', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ticket is created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it ('acks the message', async () => {
  const {listener, data, msg} = await setup();
  
  // Call the onMessage function data object + message object
  await listener.onMessage(data, msg);

  // assert ack is called
  expect(msg.ack).toHaveBeenCalled();

});