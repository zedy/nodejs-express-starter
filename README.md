# (Node.js)

## Install

1. Make sure you have `nvm` installed. [min recommended nodejs version is 16, but please use at least 18 LTS]
2. You will need to install [MongoDB](https://docs.mongodb.com/manual/administration/install-community/) database for your environment
3. You need to install a "RabbitMQ" server
4. Install node module packages `npm i`
5. Create `.env` file and add the following (add the values after the `=` symbol)

```
### Core
ENV= dev | prod | any_type_of_env
CLIENT_APP_DOMAIN=http://localhost:3000
PORT=5000

### If you're going to use MongoDB include the following
### MongoDB
MONGO_DB_URL=mongodb://localhost:27017
MONGO_DB_NAME=my_database

### Nodemailer
SERVICE_EMAIL=some@email.com
SERVICE_CLIENT_ID=...id
SERVICE_PRIVATE_KEY=...key

### AWS
AWS_REGION=us-east-2
AWS_BUCKET=name_of_s3_bucket
AWS_ACL=public-read

## MailTrap
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=...user id
MAILTRAP_PASS=...pass
```

6. Creating the AWS access credentils for S3 uploads (only do this if you want nodejs to make uploads to s3)

In your Home directory createa folder called `.aws` and inside create a file `credentials` (chmod 600)

```
[default] ; default profile
aws_access_key_id = ...id
aws_secret_access_key = ...key
```

## Usage

- The server should be running on http://localhost:5000
- The WebSocket connection is available at ws://localhost:5000/socket
- The api documentation is available at http://localhost:5000/api-docs
