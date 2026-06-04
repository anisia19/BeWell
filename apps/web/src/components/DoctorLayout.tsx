import { Outlet, Link } from "react-router-dom";

const DoctorLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: "250px",
          background: "#1e293b",
          color: "white",
          padding: "1rem",
        }}
      >
        <h2>Doctor Panel</h2>

        <nav>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li>
              <Link to="/doctor/dashboard">Dashboard</Link>
            </li>

            <li>
              <Link to="/doctor/dashboard/patients">Patients</Link>
            </li>

            <li>
              <Link to="/doctor/dashboard/appointments">Appointments</Link>
            </li>

            <li>
              <Link to="/doctor/dashboard/recommendations">
                Recommendations
              </Link>
            </li>

            <li>
              <Link to="/doctor/dashboard/settings">Settings</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;