import React, { useState } from "react";
import { Pill } from "@/components/common/Pill";
import { useToast } from "@/hooks/useToast";
import { fmtDate } from "@/lib/formatters";
import type { ApiKey } from "@/types";

interface ApiKeysTabProps {
  keys: ApiKey[];
  onKeysChange: (keys: ApiKey[]) => void;
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({
  keys,
  onKeysChange,
}) => {
  const { toast } = useToast();
  const [newKeyName, setNewKeyName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

  const handleRevoke = (id: string) => {
    if (!window.confirm("Revoke this key? Apps using it will stop working.")) {
      return;
    }
    const updated = keys.map((k) =>
      k.id === id ? { ...k, revoked: true } : k
    );
    onKeysChange(updated);
    toast("Key revoked");
  };

  const handleCreateKey = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newKeyName.trim();
    if (name.length < 2) {
      setErrorMessage("Give the key a name (2+ characters).");
      return;
    }

    setErrorMessage("");

    // Generate random 16 bytes hex demo key
    const rand = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const fullKey = `vi_test_${rand}`;

    const newKeyItem: ApiKey = {
      id: `k${Date.now()}`,
      name,
      prefix: fullKey.slice(0, 12),
      created: fmtDate(new Date().toISOString(), true),
      revoked: false,
    };

    onKeysChange([newKeyItem, ...keys]);
    setNewlyCreatedKey(fullKey);
    setNewKeyName("");
  };

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>API keys</h1>
          <p>Keys are shown once when created. Keep them out of client-side code.</p>
        </div>
      </div>

      <section className="panel">
        {newlyCreatedKey && (
          <div className="key-new">
            <strong>Copy it now. It won't be shown again.</strong>
            <br />
            <span className="mono">{newlyCreatedKey}</span>
          </div>
        )}

        <div id="keyList">
          {keys.map((k) => (
            <div key={k.id} className="key-row">
              <div>
                <strong>{k.name}</strong>{" "}
                {k.revoked && <Pill tone="plain">revoked</Pill>}
                <div className="mono muted" style={{ fontSize: "0.8rem" }}>
                  {k.prefix}•••••••••••• · created {k.created}
                </div>
              </div>
              {!k.revoked && (
                <button
                  className="btn btn--danger btn--sm"
                  type="button"
                  onClick={() => handleRevoke(k.id)}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>

        <form
          id="keyForm"
          className="btn-row"
          style={{ alignItems: "flex-end", marginTop: 24 }}
          onSubmit={handleCreateKey}
          noValidate
        >
          <div className="field" style={{ margin: 0, flex: 1, minWidth: 200 }}>
            <label htmlFor="kn">New key name</label>
            <input
              id="kn"
              maxLength={30}
              placeholder="e.g. Staging"
              value={newKeyName}
              onChange={(e) => {
                setNewKeyName(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              aria-invalid={errorMessage ? "true" : "false"}
            />
            <span className="field__err" id="ekn" aria-live="polite">
              {errorMessage}
            </span>
          </div>
          <button className="btn btn--primary" type="submit">
            Create key
          </button>
        </form>
      </section>
    </div>
  );
};

