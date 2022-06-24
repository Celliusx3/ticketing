import { Listener, OrderCancelledEvent, OrderStatus, Subjects } from "@cellius-tickets/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled= Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  
  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find ticket that order is reserving
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1
    });

    // If no ticket, throw error
    if (!order) {
      throw new Error('Order not found');
    }

    // Mark the ticket as being reserved by setting its orderId property
    order.set({status: OrderStatus.Cancelled});

    // Save the ticket
    await order.save();

    // ack the message
    msg.ack();
  }
}