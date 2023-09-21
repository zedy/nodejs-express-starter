import { Schema, model } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

export interface UserTypes {  
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  address: string;
  email: string;
  phone: string;
  password: string;
  first_login: boolean;
  profile: string;
}

const userSchema = new Schema<UserTypes>(
  {
    username: {
      type: String,
      lowercase: true,
    },
    name: String,
    first_name: { type: String, required: true },
    last_name: { type: String },
    address: String,
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator(str: string) {
          return /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/.test(str);
        },
        message: 'Please enter a valid email',
      },
      required: [true, 'Email required'],
    },
    profile: {
      default: '',
      type: String,
    },
    phone: String,    
    first_login: {
      type: Boolean,
      default: true,
    },    
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.plugin(passportLocalMongoose);

const User = model<UserTypes>('Users', userSchema);

export default User;
