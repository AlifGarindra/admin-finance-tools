interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#475569', marginBottom: 4 }}>{title}</div>
      {description && <div style={{ fontSize: 13, marginBottom: 16 }}>{description}</div>}
      {action}
    </div>
  );
}
