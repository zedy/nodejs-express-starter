// libs
import path from 'path';
import { Router } from 'express';
import multer from 'multer';

// utils
import authenticationMiddleware from '../utils/auth';

// controllers
import {
  updateUser,
  createUser,
  deleteUser,
  getUser,
} from '../controllers/UserController';

const userRoute = Router();

const upload = multer({
  dest: 'uploads/',
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

// create user
userRoute.post('/user', [authenticationMiddleware(), upload.single('file')], async (req, res) => {
    const result = await createUser(req.body);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).send(result.message);
    }
  }
);

// update user by id
userRoute.put('/user/:id', [authenticationMiddleware(), upload.single('file')], async (req, res) => {
    const result = await updateUser(req);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).send(result.message);
    }
  }
);

// delete user by id
userRoute.delete('/user/:id', authenticationMiddleware(), async (req, res) => {
  const result = await deleteUser(req);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).send(result.message);
  }
}
);

// get single user by id
userRoute.get('/user/:id', authenticationMiddleware(), async (req, res) => {
    const result = await getUser(req);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).send(result.message);
    }
  }
);

export default userRoute;
