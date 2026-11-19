import { useState } from 'react'

const FALLBACK =
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80'

export default function SmartImage({
  src,
  alt,
  className = '',
  imgClassName = '',
  ...props
}) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const imageSource = failed || !src ? FALLBACK : src

  return (
    <div className={`overflow-hidden bg-cream-200 ${className}`}>
      <img
        src={imageSource}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        {...props}
      />
    </div>
  )
}
