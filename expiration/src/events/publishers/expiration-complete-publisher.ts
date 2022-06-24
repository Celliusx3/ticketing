import { Publisher, Subjects, ExpirationCompleteEvent } from "@cellius-tickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete= Subjects.ExpirationComplete;
}