import { Medal } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface RetireButtonProps {
  playerName: string;
  age: number;
  appearances: number;
  goals: number;
  titles: number;
  onRetire: () => void;
}

/**
 * Conscious end of the playing career. Nothing is deleted: the save turns into
 * a permanent archive the player can revisit whenever he wants.
 */
export function RetireButton({
  playerName,
  age,
  appearances,
  goals,
  titles,
  onRetire,
}: RetireButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" className="w-full justify-center" onClick={() => setOpen(true)}>
        <Medal className="size-4" /> Se aposentar
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pendurar as chuteiras?</AlertDialogTitle>
            <AlertDialogDescription>
              {playerName} se aposenta aos {age} anos com {appearances} jogos, {goals} gols e{" "}
              {titles} título(s). A carreira deixa de ser simulada, mas todo o histórico fica
              salvo para sempre — você poderá revê-lo quando quiser.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar jogando</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setOpen(false);
                onRetire();
              }}
            >
              Confirmar aposentadoria
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
