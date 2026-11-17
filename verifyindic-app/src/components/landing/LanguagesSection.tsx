import React from "react";
import { appConfig } from "@/config/appConfig";
import { Pill } from "@/components/common/Pill";
import { ScrollChapter } from "./ScrollChapter";

export const LanguagesSection: React.FC = () => {
  return (
    <ScrollChapter id="languages" number="02">
      <h2>Language coverage</h2>
      <p className="section__lead">
        Honest status per language. We update this list only when it's true.
      </p>
      <ul className="pills">
        {appConfig.languages.map((l) => (
          <li key={l.name}>
            <Pill tone={l.tone}>
              {l.name} · {l.status}
            </Pill>
          </li>
        ))}
      </ul>
      <p className="muted small">
        Example statuses for layout only. Real list lives in one config file.
      </p>
    </ScrollChapter>
  );
};

