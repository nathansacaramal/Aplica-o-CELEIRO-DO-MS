import { useEffect, useState, type ReactElement } from "react";
import { Button, Card } from "@/design-system/ui";
import { AdminImageUrlField } from "@/domains/admin-cms/components/AdminImageUrlField";

interface ISiteLogoCardProps {
  currentUrl: string;
  isSaving: boolean;
  onSave: (nextImageUrl: string) => void;
}

export function SiteLogoCard({
  currentUrl,
  isSaving,
  onSave,
}: ISiteLogoCardProps): ReactElement {
  const [pendingUrl, setPendingUrl] = useState<string>(currentUrl);

  useEffect(() => {
    setPendingUrl(currentUrl);
  }, [currentUrl]);

  const hasChanges: boolean = pendingUrl.trim() !== currentUrl.trim();

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-zinc-900">Logo do site</h2>
        <p className="text-sm text-zinc-600">
          Imagem exibida no topo do site público e na página de manutenção.
        </p>
      </div>

      <AdminImageUrlField
        id="site-logo"
        label="Logo"
        value={pendingUrl}
        disabled={isSaving}
        helperText="Envie um novo arquivo para substituir a logo atual, ou cole o link (https) de uma imagem já publicada."
        onChange={setPendingUrl}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          disabled={isSaving || !hasChanges}
          isLoading={isSaving}
          onClick={() => onSave(pendingUrl)}
        >
          Salvar logo
        </Button>
      </div>
    </Card>
  );
}
