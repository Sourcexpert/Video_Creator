export function StatusPill({ status }) {
  const klass = (status || 'Draft').toLowerCase().replace(/[^a-z]+/g, '-');
  return (
    <span className={`status-pill status-${klass}`}>
      <span className="status-dot" />
      {status || 'Draft'}
    </span>
  );
}
