function InfoGrid({ items }) {
  return (
    <div className="info-grid">
      {items.map((item) => (
        <article key={item.label} className="stat-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          {item.helper ? <small>{item.helper}</small> : null}
        </article>
      ))}
    </div>
  )
}

export default InfoGrid
