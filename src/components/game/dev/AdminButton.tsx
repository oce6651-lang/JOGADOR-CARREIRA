import { useNavigate } from "@tanstack/react-router";
import { ShieldHalf } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isDeveloper, lockDeveloper, unlockDeveloper } from "@/game/dev";

/**
 * ADM shortcut for the career hub. Unlocked devices jump straight into the
 * internal tools; everyone else only sees a discreet access prompt.
 */
export function AdminButton() {
  const navigate = useNavigate();
  const [unlocked, setUnlocked] = useState(false);
  const [asking, setAsking] = useState(false);
  const [code, setCode] = useState("");

  useEffect(() => {
    setUnlocked(isDeveloper());
  }, []);

  if (unlocked) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 justify-start gap-2"
          onClick={() => navigate({ to: "/desenvolvedor" })}
        >
          <ShieldHalf className="size-4 text-primary" /> ADM · Ferramentas internas
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            lockDeveloper();
            setUnlocked(false);
            toast.success("Modo ADM bloqueado.");
          }}
        >
          Sair
        </Button>
      </div>
    );
  }

  if (!asking) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-muted-foreground"
        onClick={() => setAsking(true)}
      >
        <ShieldHalf className="size-4" /> ADM
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        autoFocus
        value={code}
        placeholder="Código de acesso"
        onChange={(event) => setCode(event.target.value)}
        className="h-9"
      />
      <Button
        onClick={() => {
          if (unlockDeveloper(code)) {
            setUnlocked(true);
            setAsking(false);
            toast.success("Modo ADM liberado.");
          } else {
            toast.error("Código inválido.");
          }
        }}
      >
        Entrar
      </Button>
    </div>
  );
}
