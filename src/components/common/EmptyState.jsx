const EmptyState = ({ icon = '📭', title = 'Nothing here yet', description = '', action = null }) => (
    <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <div className="empty-state-title">{title}</div>
        {description && <div className="empty-state-desc">{description}</div>}
        {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
);

export default EmptyState;
