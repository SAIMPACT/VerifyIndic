import { Link } from "react-router-dom";
import { ScrollChapter } from "./ScrollChapter";

export function DocsSection() {
  return (
    <ScrollChapter id="docs" number="04">
      <h2>Docs</h2>
      <p className="section__lead">
        See an example request to the analysis endpoint and learn how to read the
        risk scores and confidence levels it returns.
      </p>
      <Link className="btn btn--primary" to="/docs">
        Open API docs
      </Link>
    </ScrollChapter>
  );
}
