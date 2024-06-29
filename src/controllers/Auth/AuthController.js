import bcrypt from 'bcrypt';
import Joi from 'joi';
import prisma from '../../../Config/Prisma.js';


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

  try {
    // Check if email already exists
    const existingUser = await prisma.auth.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email telah digunakan', status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await prisma.auth.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const userResponse = {
      id: newUser.id,
      email: newUser.email,
    };

    res.status(201).json({ data: userResponse, message: 'Created successfully', status: 201 });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getUser = async (req, res) => {
  try {
    // Fetch all users
    const users = await prisma.auth.findMany({
      select: {
        id: true,
        email: true,
        token: true,
      },
    });

    if (users.length === 0) {
      return res.status(200).json({
        data: users,
        message: 'Data masih kosong',
      });
    }

    res.status(200).json({
      data: users,
      message: 'Data berhasil diambil',
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
