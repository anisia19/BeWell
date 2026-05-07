import { useState } from "react";
import "../index.css";

function AddPatient() {

  const [formData, setFormData] = useState({
    doctor_id: 1,
    email: "",
    cnp: "",
    date_of_birth: "",
    gender: "MALE",
    profession: "",
    workplace: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {

    try {

      const response = await fetch(
        "http://localhost:3001/api/patients",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Patient created successfully!");

      } else {

        alert(data.error || "Error creating patient");
      }

    } catch (error) {

      console.error(error);

      alert("Server error");
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#020617",
    color: "white",
    fontSize: "14px",
    marginTop: "6px",
    outline: "none",
    boxShadow: "none",
    height: "42px",
  };

  const labelStyle = {
    color: "#31d67b",
    fontWeight: "bold",
    fontSize: "14px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to right, #000000, #001a0d, #00331a)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "32px",
            textAlign: "center",
            fontWeight: "bold",
            marginBottom: "6px",
          }}
        >
          Add New Patient
        </h1>

        <p
          style={{
            color: "#31d67b",
            textAlign: "center",
            fontSize: "15px",
            marginBottom: "24px",
          }}
        >
          Create a patient profile
        </p>

        <div
          style={{
            backgroundColor: "#04110a",
            borderRadius: "22px",
            padding: "24px",
            border: "1px solid #0b5d2a",
          }}
        >

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Email</label>

            <input
              name="email"
              type="email"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>CNP</label>

            <input
              name="cnp"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Date of birth</label>

            <input
              name="date_of_birth"
              type="date"
              className="dark-date-input"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Gender</label>

            <select
              name="gender"
              className="dark-select"
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Profession</label>

            <input
              name="profession"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={labelStyle}>Workplace</label>

            <input
              name="workplace"
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              background:
                "linear-gradient(to right, #157a36, #22c55e)",
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Create Patient
          </button>

        </div>
      </div>
    </div>
  );
}

export default AddPatient;