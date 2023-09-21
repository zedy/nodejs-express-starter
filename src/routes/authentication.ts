/* eslint-disable consistent-return */
// libs
import { Router } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

// models
import User from '../models/user';

const authentication = Router();

passport.use(
  'login',
  new LocalStrategy((username, password, done) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Current Password is Incorrect.' });
      }

      // @ts-ignore
      const authenticate = User.authenticate();

      authenticate(username, password, (error: string, userData: any) => {
        if (error) throw Error(error);
        return done(null, userData);
      });
    });
  }),
);

// Login
authentication.post('/login', (req, res, next) => {
  // eslint-disable-next-line consistent-return
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.json({ success: false, ...info });
    }

    const {
      _id: id,
      name,
      first_name,
      last_name,
      email,
      first_login,
      profile,
    } = user;

    req.logIn(user, (errorUser) => {
      if (errorUser) {
        return next(err);
      }
    });

    if (req.body.remember_me === 'no') {
      req.session.cookie.expires = false; // Cookie expires at end of session
    } else {
      req.session.cookie.maxAge = 60 * 60 * 24 * 1000;
    }

    res.json({      
      name,      
      first_name,
      last_name,
      email,      
      first_login,  
      profile,    
      id,
    });
  })(req, res, next);
});

// Logout
authentication.post('/logout', (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (!err) {
      res
        .status(200)
        .clearCookie('connect.sid', { path: '/' })
        .json({ success: true });
    } else {
      res.end();
    }
  });
});

export default authentication;
