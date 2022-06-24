import { Publisher, Subjects, OrderCancelledEvent } from "@cellius-tickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled= Subjects.OrderCancelled;
}