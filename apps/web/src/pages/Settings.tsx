import { useState } from "react";
import "./Settings.css";

const Settings = () => {
  const [showModal, setShowModal] = useState(false);

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
          To modify your personal information, please contact the clinic administration.
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
        <button className="settings-btn" onClick={() => setShowModal(true)}>
          How to Change Password
        </button>
      </div>

      <div className="settings-card">
        <h2>Account Management</h2>
        <p className="delete-text">
          Account deletion requests cannot be completed through the application.
        </p>
        <p className="delete-text">
          For account deletion requests, please contact the clinic administration
          or visit the clinic reception for identity verification.
        </p>
        <div className="clinic-info">
          <p><strong>Clinic:</strong> Sănătatea noastră</p>
          <p><strong>Address:</strong> Str. Sapienţii nr. 28/A, Timişoara, cod 300555</p>
          <p><strong>Phone:</strong> 0356-366555</p>
          <p><strong>Fax:</strong> 0356-367555</p>
          <p><strong>Email:</strong> sanatatea_noastra@sn.ro</p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>How to Change Password</h2>
            <ol>
              <li>Log out from your account.</li>
              <li>Go to the Login page.</li>
              <li>Click <strong>'Forgot Password'</strong>.</li>
              <li>Enter your email address.</li>
              <li>Follow the instructions received by email.</li>
            </ol>
            <button className="settings-btn" onClick={() => setShowModal(false)}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;