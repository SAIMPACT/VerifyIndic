interface AccountTabProps {
  name: string;
  email: string;
  phone: string | null;
  workspace: string;
}

export function AccountTab({ name, email, phone, workspace }: AccountTabProps) {
  return (
    <>
      <div className="page-head"><h1>My account</h1></div>
      <section className="panel max-w-xl">
        <dl className="grid gap-4">
          <div><dt className="eyebrow">Name</dt><dd>{name}</dd></div>
          <div><dt className="eyebrow">Email</dt><dd className="break-all">{email}</dd></div>
          <div><dt className="eyebrow">Phone number</dt><dd>{phone ?? "Not provided"}</dd></div>
          <div><dt className="eyebrow">Workspace</dt><dd>{workspace}</dd></div>
        </dl>
      </section>
    </>
  );
}
