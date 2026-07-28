interface PageContainerProps {
  title: string;
  description?: string;
  /** Optional slot for page-level actions (e.g. future "New COA" button). */
  actions?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Standard page wrapper: title, description, optional actions, and content.
 * Every route page.tsx should render its content inside this component
 * to keep spacing and typography consistent across the app.
 */
export default function PageContainer({
  title,
  description,
  actions,
  children,
}: PageContainerProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
      </div>

      {children}
    </div>
  );
}
