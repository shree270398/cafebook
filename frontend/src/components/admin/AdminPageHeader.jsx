export default function AdminPageHeader({
  eyebrow = 'Admin console',
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 text-3xl text-coffee-900 sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-coffee-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
