import { Ticket } from "../ticket";

it('implements optimistic concurrency control', async () => {
  // Create an instace of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  })

  // Save the ticket to database
  await ticket.save();

  // Fetch the ticket
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // Make separate changes to the tickets
  firstInstance!.set({price: 10});
  secondInstance!.set({price: 15});

  // Save the first fetched ticket
  await firstInstance!.save();

  // Save the second fetched ticket and expect an error
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error ('Should not reach this point');
});

it('increment the version number on multiple saves', async () => {
  // Create an instace of a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123'
  })

  // Save the ticket to database
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});