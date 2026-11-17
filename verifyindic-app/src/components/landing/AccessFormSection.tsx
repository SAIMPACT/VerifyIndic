import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  earlyAccessFields,
  earlyAccessLimits,
  useCases,
  validateEarlyAccessField,
  type EarlyAccessField,
} from "@/lib/earlyAccess";

const emptyForm = { name: "", email: "", company: "", use: "" };

export const AccessFormSection: React.FC = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "saved" | "failed">("idle");
  const [submitError, setSubmitError] = useState("");
  const requestId = useRef<string | null>(null);
  const isSubmitting = status === "submitting";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const field = name as EarlyAccessField;
    requestId.current = null;
    setStatus("idle");
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const error = validateEarlyAccessField(name as EarlyAccessField, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors = { ...emptyForm };
    for (const field of earlyAccessFields) {
      newErrors[field] = validateEarlyAccessField(field, formData[field]);
    }
    setErrors(newErrors);

    const firstInvalidField = earlyAccessFields.find((field) => newErrors[field]);
    if (firstInvalidField) {
      const input = e.currentTarget.elements.namedItem(firstInvalidField);
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    setStatus("submitting");
    setSubmitError("Couldn’t save your request. Please try again.");
    try {
      requestId.current ??= crypto.randomUUID();
      const response = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, requestId: requestId.current }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) {
        if (response.status === 429) setSubmitError("Too many requests. Please try again later.");
        if (response.status === 409) requestId.current = null;
        setStatus("failed");
        return;
      }

      const result = await response.json();
      if (result?.saved !== true) {
        setStatus("failed");
        return;
      }

      requestId.current = null;
      setFormData(emptyForm);
      setStatus("saved");
    } catch {
      setStatus("failed");
    }
  };

  return (
    <section className="section" id="access">
      <div className="container">
        <h2>Request early access</h2>
        <p className="section__lead">
          Tell us what you're trying to protect.{" "}
          <Link to="/docs">Docs</Link> will be linked here when they exist.
        </p>

        <form id="accessForm" className="access" onSubmit={handleSubmit} aria-busy={isSubmitting} noValidate>
          <div className="field">
            <label htmlFor="fName">Name</label>
            <input
              id="fName"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={earlyAccessLimits.name}
              required
              disabled={isSubmitting}
              aria-describedby="eName"
              aria-invalid={errors.name ? "true" : "false"}
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <span className="field__err" id="eName" aria-live="polite">
              {errors.name}
            </span>
          </div>

          <div className="field">
            <label htmlFor="fEmail">Email</label>
            <input
              id="fEmail"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={earlyAccessLimits.email}
              required
              disabled={isSubmitting}
              aria-describedby="eEmail"
              aria-invalid={errors.email ? "true" : "false"}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <span className="field__err" id="eEmail" aria-live="polite">
              {errors.email}
            </span>
          </div>

          <div className="field">
            <label htmlFor="fCompany">Company</label>
            <input
              id="fCompany"
              name="company"
              type="text"
              autoComplete="organization"
              maxLength={earlyAccessLimits.company}
              required
              disabled={isSubmitting}
              aria-describedby="eCompany"
              aria-invalid={errors.company ? "true" : "false"}
              value={formData.company}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <span className="field__err" id="eCompany" aria-live="polite">
              {errors.company}
            </span>
          </div>

          <div className="field">
            <label htmlFor="fUse">Use case</label>
            <select
              id="fUse"
              name="use"
              required
              disabled={isSubmitting}
              aria-describedby="eUse"
              aria-invalid={errors.use ? "true" : "false"}
              value={formData.use}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="">Select one…</option>
              {useCases.map((useCase) => (
                <option key={useCase} value={useCase}>{useCase}</option>
              ))}
            </select>
            <span className="field__err" id="eUse" aria-live="polite">
              {errors.use}
            </span>
          </div>

          <button className="btn btn--primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Request early access"}
          </button>

          {status === "saved" && (
            <p className="access__ok" id="accessOk" role="status">
              Thanks. Your early-access request was received.
            </p>
          )}
          {status === "failed" && (
            <p className="field__err" role="alert">{submitError}</p>
          )}
        </form>
      </div>
    </section>
  );
};

