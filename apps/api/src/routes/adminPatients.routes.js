import express from "express";
import {
    createPatient,
    createUser,
    getPatients,
    getUsersByRole,
    updatePatient,
    updateUser,
} from "../services/adminPatients.service.js";

const router = express.Router();

router.get("/patients", async(req, res) => {
    try {
        const patients = await getPatients();
        res.json(patients);
    } catch (error) {
        console.error("GET patients error:", error);
        res.status(500).json({ error: "Could not fetch patients" });
    }
});


router.post("/patients", async(req, res) => {
    try {
        const patient = await createPatient(req.body);
        res.status(201).json({ patient });
    } catch (error) {
        console.error("POST patient error:", error);

        if (error.code === "DUPLICATE_EMAIL") {
            return res.status(409).json({ error: "Email already exists" });
        }

        if (error.code === "DUPLICATE_CNP") {
            return res.status(409).json({ error: "CNP already exists" });
        }

        res.status(500).json({ error: "Could not create patient" });
    }
});

router.put("/patients/:id", async(req, res) => {
    try {
        await updatePatient(req.params.id, req.body);
        res.json({ message: "Updated successfully" });
    } catch (error) {
        console.error("PUT patient error:", error);

        if (error.code === "NOT_FOUND") {
            return res.status(404).json({ error: "Patient not found" });
        }

        res.status(500).json({ error: "Could not update patient" });
    }
});

router.get("/users", async(req, res) => {
    const { role } = req.query;
    if (!role || !["DOCTOR", "ADMIN"].includes(role)) {
        return res.status(400).json({ error: "role must be DOCTOR or ADMIN" });
    }
    try {
        const users = await getUsersByRole(role);
        res.json(users);
    } catch (error) {
        console.error("GET users error:", error);
        res.status(500).json({ error: "Could not fetch users" });
    }
});

router.post("/users", async(req, res) => {
    try {
        const user = await createUser(req.body);
        res.status(201).json({ user });
    } catch (error) {
        console.error("POST user error:", error);
        if (error.code === "DUPLICATE_EMAIL") {
            return res.status(409).json({ error: "Email already exists" });
        }
        res.status(500).json({ error: "Could not create user" });
    }
});

router.put("/users/:id", async(req, res) => {
    try {
        await updateUser(req.params.id, req.body);
        res.json({ message: "Updated successfully" });
    } catch (error) {
        console.error("PUT user error:", error);
        res.status(500).json({ error: "Could not update user" });
    }
});

export default router;