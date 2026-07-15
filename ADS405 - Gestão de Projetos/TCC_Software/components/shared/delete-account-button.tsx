"use client";

import { Button } from "@/components/ui/button";
import { deleteAccountAction } from "@/server/actions/profile.actions";

export function DeleteAccountButton() {
  return (
    <form
      action={deleteAccountAction}
      onSubmit={(e) => {
        if (!confirm("Tem certeza? Esta ação é irreversível e remove todos os seus dados.")) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive">
        Excluir minha conta
      </Button>
    </form>
  );
}
