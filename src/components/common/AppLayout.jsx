import Sidebar from './Sidebar.jsx';
import Navbar from './Navbar.jsx';

const AppLayout = ({ children, title }) => (
    <div className="app-layout">
        <Sidebar />
        <div className="main-content">
            <Navbar title={title} />
            <main className="page-container">{children}</main>
        </div>
    </div>
);

export default AppLayout;
