import { Publisher, Subjects, TicketUpdatedEvent } from "@cellius-tickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated= Subjects.TicketUpdated;
}