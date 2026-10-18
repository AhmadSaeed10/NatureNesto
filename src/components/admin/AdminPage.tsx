interface AdminPageProps {
  title: string;
  intro?: string;
  /** Right aligned header content, for example a primary action. */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function AdminPage({ title, intro, actions, children }: AdminPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 md:px-8 lg:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex max-w-2xl flex-col gap-2">
          <h1 className="text-h3">{title}</h1>
          {intro ? <p className="text-ink-muted">{intro}</p> : null}
        </div>
        {actions}
      </header>
      {children}
    </div>
  );
}

interface AdminCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AdminCard({ title, description, children }: AdminCardProps) {
  return (
    <section className="flex flex-col gap-5 rounded-card border border-line bg-background p-5 md:p-6">
      {title ? (
        <header className="flex flex-col gap-1">
          <h2 className="text-h4">{title}</h2>
          {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}
