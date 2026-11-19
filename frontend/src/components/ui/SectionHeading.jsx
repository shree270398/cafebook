export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  className = '',
}) {
  const isCenter = align === 'center'

  return (
    <div
      className={`flex flex-col gap-4 ${
        isCenter ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'
      } ${className}`}
    >
      <div className={isCenter ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 text-3xl leading-tight text-coffee-900 sm:text-4xl">{title}</h2>
        {description && (
          <p className="mt-3 text-sm leading-relaxed text-coffee-500 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
