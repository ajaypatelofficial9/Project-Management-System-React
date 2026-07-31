const Spinner = ({ size = 'md', center = false }) => {
    const cls = `spinner spinner-${size}`;
    if (center) {
        return (
            <div className="spinner-container">
                <div className={cls} />
            </div>
        );
    }
    return <div className={cls} />;
};

export default Spinner;
