// Gemeinsame Slot-Helfer fuer BR5 ("ein Slot, ein Termin"). Sie laufen in einer
// Transaktion und sichern die Regel hart ab: Der Slot wird nur dann belegt, wenn
// er noch FREI ist, und nur dann freigegeben, wenn er BELEGT ist.

export type Tx = {
  slot: {
    updateMany: (args: {
      where: { id: number; status: "FREI" | "BELEGT" };
      data: { status: "FREI" | "BELEGT" };
    }) => Promise<{ count: number }>;
  };
};

// Belegt einen freien Slot. Gibt false zurueck, wenn jemand schneller war.
export async function belegeSlot(tx: Tx, slotId: number): Promise<boolean> {
  const ergebnis = await tx.slot.updateMany({
    where: { id: slotId, status: "FREI" },
    data: { status: "BELEGT" },
  });
  return ergebnis.count > 0;
}

// Gibt einen belegten Slot wieder frei (z. B. beim Absagen oder Umbuchen).
export async function gibSlotFrei(tx: Tx, slotId: number): Promise<boolean> {
  const ergebnis = await tx.slot.updateMany({
    where: { id: slotId, status: "BELEGT" },
    data: { status: "FREI" },
  });
  return ergebnis.count > 0;
}
