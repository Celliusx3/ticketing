import { Publisher, Subjects, PaymentCreatedEvent } from "@cellius-tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated= Subjects.PaymentCreated;
}