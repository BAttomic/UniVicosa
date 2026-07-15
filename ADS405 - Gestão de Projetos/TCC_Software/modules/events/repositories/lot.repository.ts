import Lot from "../models/lot.model";

const L = Lot as unknown as {
  create(data: any): Promise<any>;
  find(filter: Record<string, unknown>): any;
  findById(id: string): any;
  findByIdAndUpdate(id: string, data: any, options: any): any;
};

export async function create(data: any) {
  return (await L.create(data)) as unknown as any;
}

export async function findByTicketTypeId(ticketTypeId: string) {
  return (await L.find({ ticketTypeId }).lean()) as unknown as any[];
}

export async function findById(id: string) {
  return (await L.findById(id).lean()) as unknown as any;
}

// A lot is "on sale now" when it is active and the current time falls inside its
// optional window. Missing startsAt means "already started"; missing endsAt means
// "never ends" — otherwise lots created without a schedule (incl. seed data) would
// never be considered active and the event would show no tickets for sale.
export async function findActiveByTicketTypeId(ticketTypeId: string) {
  const now = new Date();
  return (
    await L.find({
      ticketTypeId,
      active: true,
      $and: [
        { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
        { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
      ],
    })
      .sort({ startsAt: 1, createdAt: 1 })
      .lean()
  ) as unknown as any[];
}

// The next lot scheduled to open in the future (used to power the waitlist when an
// event is "almost on sale": no active lot now, but one is coming).
export async function findUpcomingByTicketTypeId(ticketTypeId: string) {
  const now = new Date();
  return (
    await L.find({
      ticketTypeId,
      active: true,
      startsAt: { $gt: now },
    })
      .sort({ startsAt: 1 })
      .lean()
  ) as unknown as any[];
}

export async function findByTicketTypeIds(ticketTypeIds: string[]) {
  return (await L.find({ ticketTypeId: { $in: ticketTypeIds } }).lean()) as unknown as any[];
}

export async function update(id: string, data: any) {
  return (await L.findByIdAndUpdate(id, data, { new: true }).lean()) as unknown as any;
}
