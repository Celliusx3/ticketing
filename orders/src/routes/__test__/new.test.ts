import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', globalThis.signin())
    .send({ticketId});

  expect(response.status).toEqual(404);
})

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId: '123',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });

  await order.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', globalThis.signin())
    .send({ ticketId: ticket.id });
    
  expect(response.status).toEqual(400);
})

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', globalThis.signin())
    .send({ ticketId: ticket.id });

  expect(response.status).toEqual(201);
})

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20
  });

  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', globalThis.signin())
    .send({ ticketId: ticket.id });

  expect(response.status).toEqual(201);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});