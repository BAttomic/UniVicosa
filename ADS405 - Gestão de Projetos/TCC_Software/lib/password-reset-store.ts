type ResetTokenRecord = {
  userId: string;
  expiresAt: number;
};

const resetTokens = new Map<string, ResetTokenRecord>();

export function saveResetToken(token: string, userId: string): void {
  resetTokens.set(token, {
    userId,
    expiresAt: Date.now() + 30 * 60 * 1000,
  });
}

export function consumeResetToken(token: string): string | null {
  const record = resetTokens.get(token);
  if (!record) {
    return null;
  }

  if (record.expiresAt < Date.now()) {
    resetTokens.delete(token);
    return null;
  }

  resetTokens.delete(token);
  return record.userId;
}
