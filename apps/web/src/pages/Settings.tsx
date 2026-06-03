import "./Settings.css";

const Settings = () => {
  const showPasswordInfo = () => {
    alert(
      "To change your password:\n\n" +
        "1. Log out from your account.\n" +
        "2. Go to the Login page.\n" +
        "3. Click 'Forgot Password'.\n" +
        "4. Enter your email address.\n" +
        "5. Follow the instructions received by email."
    );
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <div className="settings-card">
        <h2>Profile Information</h2>

        <div className="info-group">
          <label>Doctor Name</label>
          <p>John Doe</p>
        </div>

        <div className="info-group">
          <label>Email</label>
          <p>doctor1@bewell.com</p>
        </div>

        <div className="info-group">
          <label>Phone Number</label>
          <p>0712345678</p>
        </div>

        <div className="info-group">
          <label>Role</label>
          <p>Doctor</p>
        </div>

        <p className="info-message">
          To modify your personal information,
          please contact the clinic
          administration.
        </p>
      </div>

      <div className="settings-card">
        <h2>Account Information</h2>

        <div className="info-group">
          <label>Account Status</label>
          <p>Active</p>
        </div>
      </div>

      <div className="settings-card">
        <h2>Security</h2>

        <div className="info-group">
          <label>Password</label>
          <p>********</p>
        </div>

        <button
          className="settings-btn"
          onClick={showPasswordInfo}
        >
          How to Change Password
        </button>
      </div>

      <div className="settings-card">
        <h2>Account Management</h2>

        <p className="delete-text">
          Account deletion requests cannot be
          completed through the application.
        </p>

        <p className="delete-text">
          For account deletion requests,
          please contact the clinic
          administration or visit the clinic
          reception for identity verification.
        </p>

        <div className="clinic-info">
          <p>
            <strong>Clinic:</strong>{" "}
            Sănătatea noastră
          </p>

          <p>
            <strong>Address:</strong>{" "}
            Str. Sapienţii nr. 28/A,
            Timişoara, cod 300555
          </p>

          <p>
            <strong>Phone:</strong>{" "}
            0356-366555
          </p>

          <p>
            <strong>Fax:</strong>{" "}
            0356-367555
          </p>

          <p>
            <strong>Email:</strong>{" "}
            sanatatea_noastra@sn.ro
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;