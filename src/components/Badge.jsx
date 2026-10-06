export function Badge({ children, tone = 'default', icon: Icon }) {
  return (
    <span className={`badge badge-${tone}`}>
      {Icon && <Icon size={13} strokeWidth={2.2} />}
      {children}
    </span>
  );
}
