import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import "../index.css";
import "./AddPatient.css";

function AddPatient() {

  const toast = useToast();

  const [formData, setFormData] = useState({
    doctor_id: 1,
    email: "",
    cnp: "",
    date_of_birth: "",
    gender: "MALE",
    profession: "",
    workplace: "",
  });

  const [cnpError, setCnpError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    const { name, value } = e.target;

    if (name === "cnp") {

      // doar cifre
      if (!/^\d*$/.test(value)) {

        setCnpError("CNP must contain only numbers");
        return;
      }

      // maxim 13 cifre
      if (value.length > 13) {

        setCnpError(
          "CNP cannot contain more than 13 digits"
        );

        return;
      }

      // prima cifra
      if (
        value.length > 0 &&
        !["1", "2", "5", "6"].includes(value[0])
      ) {

        setCnpError(
          "CNP must start with 1, 2, 5 or 6"
        );

      } else {

        setCnpError("");
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {

    if (formData.cnp.length !== 13) {

      setCnpError(
        "CNP must contain exactly 13 digits"
      );

      return;
    }

    if (cnpError) {
      return;
    }

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

        toast({
          title: "Patient created",
          description:
            "Patient was added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

      } else {

        toast({
          title: "Error",
          description:
            data.error || "Failed to create patient",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }

    } catch (error) {

      console.error(error);

      toast({
        title: "Server Error",
        description:
          "Something went wrong",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="add-patient-page">

      <div className="add-patient-container">

        <h1 className="add-patient-title">
          Add New Patient
        </h1>

        <p className="add-patient-subtitle">
          Create a patient profile
        </p>

        <div className="add-patient-card">

          <div className="add-patient-field">
            <label className="add-patient-label">
              Email
            </label>

            <input
              name="email"
              type="email"
              onChange={handleChange}
              className="add-patient-input"
            />
          </div>

          <div className="add-patient-field">
            <label className="add-patient-label">
              CNP
            </label>

            <input
              name="cnp"
              value={formData.cnp}
              onChange={handleChange}
              className="add-patient-input"
            />

            {cnpError && (
              <p className="add-patient-error">
                {cnpError}
              </p>
            )}
          </div>

          <div className="add-patient-field">
            <label className="add-patient-label">
              Date of birth
            </label>

            <input
              name="date_of_birth"
              type="date"
              onChange={handleChange}
              className="add-patient-input"
            />
          </div>

          <div className="add-patient-field">
            <label className="add-patient-label">
              Gender
            </label>

            <select
              name="gender"
              onChange={handleChange}
              className="add-patient-input"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="add-patient-field">
            <label className="add-patient-label">
              Profession
            </label>

            <input
              name="profession"
              onChange={handleChange}
              className="add-patient-input"
            />
          </div>

          <div className="add-patient-field">
            <label className="add-patient-label">
              Workplace
            </label>

            <input
              name="workplace"
              onChange={handleChange}
              className="add-patient-input"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="add-patient-button"
          >
            Create Patient
          </button>

        </div>

      </div>

    </div>
  );
}

export default AddPatient;