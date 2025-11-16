import { useState } from "react";
import { X, Plus } from "lucide-react";
import { ThemedInput } from "@/components/ui/themed-input";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedBadge } from "@/components/ui/themed-badge";

interface AliasesInputProps {
  aliases: string[];
  onChange: (aliases: string[]) => void;
}

export const AliasesInput = ({ aliases, onChange }: AliasesInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  const validateAlias = (alias: string): string | null => {
    if (alias.length < 2) return "Alias must be at least 2 characters";
    if (alias.length > 50) return "Alias must be 50 characters or less";
    if (!/^[a-zA-Z0-9\s'&.,-]+$/.test(alias)) {
      return "Only letters, numbers, spaces, hyphens, apostrophes, periods, ampersands, and commas allowed";
    }
    if (aliases.some(a => a.toLowerCase() === alias.toLowerCase())) {
      return "This alias already exists";
    }
    if (aliases.length >= 10) return "Maximum 10 aliases allowed";
    return null;
  };

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const validationError = validateAlias(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    onChange([...aliases, trimmed]);
    setInputValue("");
    setError("");
  };

  const handleRemove = (index: number) => {
    onChange(aliases.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <ThemedInput
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter an alias (e.g., Young Hov)"
          className="flex-1"
        />
        <ThemedButton
          type="button"
          onClick={handleAdd}
          variant="secondary"
          size="sm"
          disabled={!inputValue.trim()}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </ThemedButton>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {aliases.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {aliases.map((alias, index) => (
            <ThemedBadge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span>{alias}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label={`Remove ${alias}`}
              >
                <X className="h-3 w-3" />
              </button>
            </ThemedBadge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No aliases yet. Add common nicknames this rapper is known by.
        </p>
      )}

      {aliases.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {aliases.length} of 10 aliases
        </p>
      )}
    </div>
  );
};
