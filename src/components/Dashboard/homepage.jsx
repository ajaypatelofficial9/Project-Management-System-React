import { Link } from 'react-router-dom';

const HomePage = () => {
    return <>
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <h1 className="mb-4">Welcome to User Login App</h1>
                <div className="d-grid gap-3 col-6 mx-auto">
                    <Link to="/login" className="text-decoration-none">
                        <button className="btn btn-primary btn-lg w-100">Login</button>
                    </Link>
                    <Link to="/signup" className="text-decoration-none">
                        <button className="btn btn-success btn-lg w-100">Signup</button>
                    </Link>
                    <Link to="/profile" className="text-decoration-none">
                        <button className="btn btn-info btn-lg w-100">User Profile</button>
                    </Link>
                </div>
            </div>
        </div>
    </>
}
export default HomePage;