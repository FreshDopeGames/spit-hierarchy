import { ThemedBadge } from "@/components/ui/themed-badge";

interface RapperAliasesProps {
  aliases: string[];
}

export const RapperAliases = ({ aliases }: RapperAliasesProps) => {
  if (!aliases || aliases.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Also known as:</span>
      {aliases.map((alias, index) => (
        <ThemedBadge
          key={index}
          variant="secondary"
          className="text-xs"
        >
          {alias}
        </ThemedBadge>
      ))}
    </div>
  );
};
