import bcrypt from "bcrypt";
import Joi from "joi";
import { pool } from "../../../Config/Databases/db.js";

export const HandleRegister = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(req.body);
  const { email, password } = req.body;

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  pool.query('SELECT * FROM Auth WHERE email = ?', [email], async (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (rows.length > 0) {
      return res.status(400).json({ message: "Email telah digunakan", status: 400 });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      pool.query('INSERT INTO auth (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        const userResponse = {
          id: result.insertId,
          email,
        };

        res.status(201).json({ data: userResponse, message: "created succes", status: 201 });
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
};

export const getUser = async (req, res) => {
  pool.query('SELECT id, email, token FROM Auth', (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    if (rows.length === 0) {
      return res.status(200).json({
        data: rows,
        message: "Data masih kosong",
      });
    }

    res.status(200).json({
      data: rows,
      message: "Data berhasil diambil",
    });
  });
};
