import User, { IUser } from "../models/user.model";

const UserModel = User as unknown as {
  create(data: any): Promise<any>;
  findOne(filter: Record<string, unknown>): any;
  find(filter: Record<string, unknown>): any;
  findById(id: string): any;
  findByIdAndUpdate(id: string, data: Record<string, unknown>, options: Record<string, unknown>): any;
  findByIdAndDelete(id: string): any;
  insertMany(docs: any[]): Promise<any[]>;
};

export async function createUser(data: Omit<IUser, "_id" | "createdAt">): Promise<IUser> {
  return (await UserModel.create(data)) as unknown as IUser;
}

export async function findByEmail(email: string): Promise<IUser | null> {
  return (await UserModel.findOne({ email }).lean()) as unknown as (IUser | null);
}

export async function findById(id: string): Promise<IUser | null> {
  return (await UserModel.findById(id).lean()) as unknown as (IUser | null);
}

// CPF is stored with `select: false`; this variant opts it back in for screens
// that legitimately need to show/edit it (e.g. the owner's own profile).
export async function findByIdWithCpf(id: string): Promise<IUser | null> {
  return (await UserModel.findById(id).select("+cpf").lean()) as unknown as (IUser | null);
}

export async function findAllUsers(): Promise<IUser[]> {
  return (await UserModel.find({}).sort({ createdAt: -1 }).lean()) as unknown as IUser[];
}

export async function updatePasswordById(id: string, passwordHash: string): Promise<IUser | null> {
  return (await UserModel.findByIdAndUpdate(id, { passwordHash }, { new: true }).lean()) as unknown as (IUser | null);
}

export async function updateUserById(
  id: string,
  data: Partial<Pick<IUser, "email" | "name" | "role" | "phone" | "cpf" | "emailVerifiedAt">> & { passwordHash?: string },
): Promise<IUser | null> {
  return (await UserModel.findByIdAndUpdate(id, data, { new: true }).lean()) as unknown as (IUser | null);
}

export async function deleteUserById(id: string): Promise<IUser | null> {
  return (await UserModel.findByIdAndDelete(id).lean()) as unknown as (IUser | null);
}

// Email verification: token is stored on the user (select:false) and consumed
// once on confirmation, when emailVerifiedAt is set.
export async function findByVerificationToken(token: string): Promise<IUser | null> {
  return (await UserModel.findOne({ emailVerificationToken: token })
    .select("+emailVerificationToken")
    .lean()) as unknown as (IUser | null);
}

export async function markEmailVerified(id: string): Promise<IUser | null> {
  return (await UserModel.findByIdAndUpdate(
    id,
    { emailVerifiedAt: new Date(), $unset: { emailVerificationToken: 1 } },
    { new: true },
  ).lean()) as unknown as (IUser | null);
}
