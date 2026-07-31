const formatBadgeText = (value = '') =>
    value
        .toString()
        .replace(/_/g, ' ')
        .trim()
        .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());

const Badge = ({ value }) => {
    const key = (value || 'unknown').toString().toLowerCase().replace(/\s+/g, '_');
    const label = formatBadgeText(value);

    return (
        <span className={`badge badge-${key}`} title={label}>
            {label}
        </span>
    );
};

export default Badge;
