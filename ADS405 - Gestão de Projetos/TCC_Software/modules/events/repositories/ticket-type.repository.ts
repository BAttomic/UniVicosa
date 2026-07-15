import TicketType from "../models/ticket-type.model";

const TT = TicketType as unknown as {
  create(data: any): Promise<any>;
  find(filter: Record<string, unknown>): any;
  findById(id: string): any;
  findByIdAndUpdate(id: string, data: any, options: any): any;
  findOneAndUpdate(filter: any, update: any, options: any): any;
};

export async function create(data: any) {
  return (await TT.create(data)) as unknown as any;
}

export async function findByEventId(eventId: string) {
  return (await TT.find({ eventId }).lean()) as unknown as any[];
}

export async function findById(id: string) {
  return (await TT.findById(id).lean()) as unknown as any;
}

export async function update(id: string, data: any) {
  return (await TT.findByIdAndUpdate(id, data, { new: true }).lean()) as unknown as any;
}

export async function incrementSoldQuantity(ticketTypeId: string, quantity: number) {
  return (await TT.findByIdAndUpdate(ticketTypeId, { $inc: { soldQuantity: quantity } }, { new: true })) as unknown as any;
}
