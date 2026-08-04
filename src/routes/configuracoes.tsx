import { createFileRoute, Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

import { GameShell, PageHeader } from "@/components/game/GameShell";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGame } from "@/game/GameProvider";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Project Football Career" },
      {
        name: "description",
        content: "Ajuste som, animações e salvamento automático do simulador de carreira.",
      },
      { property: "og:title", content: "Configurações — Project Football Career" },
      {
        property: "og:description",
        content: "Som, animações e salvamento automático.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, updateSettings } = useGame();

  const options = [
    { key: "soundEnabled" as const, label: "Som", hint: "Efeitos sonoros do jogo" },
    {
      key: "animationsEnabled" as const,
      label: "Animações",
      hint: "Transições e movimentos da interface",
    },
    {
      key: "autoSave" as const,
      label: "Salvamento automático",
      hint: "Grava a carreira a cada ação",
    },
  ];

  return (
    <GameShell>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-primary"
      >
        <Home className="size-3.5" /> Menu principal
      </Link>

      <PageHeader
        eyebrow="Configurações"
        title="Preferências"
        description="Ajustes gerais do jogo. Salvos localmente no seu navegador."
      />

      <div className="panel animate-rise divide-y divide-border">
        {options.map((option) => (
          <div key={option.key} className="flex items-center justify-between gap-4 p-5">
            <div>
              <Label className="text-base">{option.label}</Label>
              <p className="text-xs text-muted-foreground">{option.hint}</p>
            </div>
            <Switch
              checked={settings[option.key]}
              onCheckedChange={(checked) => updateSettings({ [option.key]: checked })}
            />
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 p-5">
          <div>
            <Label className="text-base">Idioma</Label>
            <p className="text-xs text-muted-foreground">Português (Brasil)</p>
          </div>
          <span className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs uppercase tracking-widest">
            pt-BR
          </span>
        </div>
      </div>

      <DeveloperGate />
    </GameShell>
  );
}

/** Discreet entry point: invisible until the authorised code is entered. */
function DeveloperGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    setUnlocked(isDeveloper());
  }, []);

  if (unlocked) {
    return (
      <div className="mt-10 flex items-center justify-between gap-3">
        <Link
          to="/desenvolvedor"
          className="text-xs uppercase tracking-[0.25em] text-primary hover:underline"
        >
          Modo Desenvolvedor
        </Link>
        <button
          type="button"
          className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive"
          onClick={() => {
            lockDeveloper();
            setUnlocked(false);
          }}
        >
          Bloquear
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 text-right">
      {asking ? (
        <form
          className="flex justify-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (unlockDeveloper(code)) {
              setUnlocked(true);
              setAsking(false);
            }
            setCode("");
          }}
        >
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Código de acesso"
            className="h-8 w-48"
          />
          <Button type="submit" size="sm" variant="secondary">
            Entrar
          </Button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAsking(true)}
          className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        >
          Modo Desenvolvedor
        </button>
      )}
    </div>
  );
}
