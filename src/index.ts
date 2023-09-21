// libs
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import WebSocket from 'ws';
import http from 'http';
import { connect } from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import responseTime from 'response-time';
import hbs from 'nodemailer-express-handlebars';

// models
import User from './models/user';

// routes
import authentication from './routes/authentication';
import userRoutes from './routes/user';

// Initialize Express
const app = express();

// PORT
const PORT = process.env.PORT || 5000;

// Secure HTTP headers
app.use(helmet());

//Create a middleware that adds a X-Response-Time header to responses.
app.use(responseTime());

app.engine(
  'hbs',
  hbs({
    extname: 'hbs',
    defaultLayout: false,
    layoutsDir: 'views/'
  })
);

// Configure CORS policy if you're going to use this a decoupled server for your JS app
// const whitelist = [
//   process.env.CLIENT_APP_DOMAIN,
// ];

const corsMiddlewareOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      const msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
      callback(new Error(msg));
    }
  },
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(cors(corsMiddlewareOptions));

// Enable pre-flight request for form-data requests
// For any HTTP verb other than GET/HEAD/POST (such as DELETE) or routes that use custom headers.
app.options('*', cors()); // include before other routes
// or
app.options('/api/any/url/example', cors(corsMiddlewareOptions));

// Parse JSON request body
app.use(express.json({ limit: '100000mb' }));
app.use(express.urlencoded({ extended: false, limit: '100000mb' }));

// Initialize authentication middleware
app.set('trust proxy', 1);
app.use(
  session({
    secret: 'test',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: `${process.env.MONGO_DB_URL}/${process.env.MONGO_DB_NAME}`,
    }),
    cookie: {
      secure: true, // can be false if doing local dev, but better to leave it to true
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// USE "createStrategy" INSTEAD OF "authenticate"
// This uses and configures passport-local behind the scenes
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// List of all api routes
// Authentication route
app.use('/api/authentication', authentication);

// General
app.use('/api/user', userRoutes);

// Connect to database
connect(`${process.env.MONGO_DB_URL}/${process.env.MONGO_DB_NAME}`);

// Start WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/socket' });

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();

    ws.isAlive = false;
    ws.ping();
    ws.send(JSON.stringify({ type: 'pong' }));
  });
}, 5000);

wss.on('close', () => {
  clearInterval(interval);
});

// Start the server
server.listen(PORT, () =>
  console.log(`Server started and listening on ${PORT}`)
);

export default wss;
