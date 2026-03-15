function AreaIcon({ paths }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      {paths.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  )
}

export default AreaIcon
