import { OrderStatus } from '@cellius-tickets/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';

jest.mock('../../stripe');

it('returns a 404 if order does not exist', async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', globalThis.signin())
    .send({
      token: '123',
      orderId
    });

  expect(response.status).toEqual(404);
})

it('returns a 401 if purchasing order doesnt belong to that user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    price: 20
  });

  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', globalThis.signin())
    .send({
      token: '123',
      orderId: order.id
    });

  expect(response.status).toEqual(401);
})

it('returns 400 if purchasing cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    status: OrderStatus.Cancelled,
    price: 20
  });

  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', globalThis.signin(userId))
    .send({
      token: '123',
      orderId: order.id
    });

  expect(response.status).toEqual(400);
})

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    status: OrderStatus.Created,
    price: 20
  });

  await order.save();

  const response = await request(app)
    .post('/api/payments')
    .set('Cookie', globalThis.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id
    });

  expect(response.status).toEqual(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(20 * 100);
  expect(chargeOptions.currency).toEqual('usd');


})
