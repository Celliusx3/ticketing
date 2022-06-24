import { Publisher, Subjects, OrderCreatedEvent } from "@cellius-tickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated= Subjects.OrderCreated;
}