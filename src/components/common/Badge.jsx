const Badge = ({ value }) => {
    const key = (value || '').toLowerCase().replace(/\s/g, '_');
    return <span className={`badge badge-${key}`}>{value}</span>;
};

export default Badge;
