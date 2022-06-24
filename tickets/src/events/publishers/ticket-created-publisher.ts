import { Publisher, Subjects, TicketCreatedEvent } from "@cellius-tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated= Subjects.TicketCreated;
}