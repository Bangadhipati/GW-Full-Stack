// backend/src/models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = "admin" | "editor" | "ad_manager";

export interface IAppUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IAppUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // keep as required:false for now
    role: { type: String, enum: ['admin', 'editor', 'ad_manager'], default: 'editor' },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  // Only hash if the password field is modified AND it exists
  if (!this.isModified('password') || !this.password) {
    console.log(
      `[USER MODEL - pre('save')] Skipping password hash for ${
        this.email
      }. Password modified: ${this.isModified('password')}, Password exists: ${!!this.password}.`
    );
    return next();
  }
  console.log(`[USER MODEL - pre('save')] Hashing password for user: ${this.email}`);
  console.log(`[USER MODEL - pre('save')] Original password length (before hash): ${this.password.length}`);
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  console.log(
    `[USER MODEL - pre('save')] Password hashed successfully for ${
      this.email
    }. New hashed password (first 10 chars): ${this.password.substring(0, 10)}`
  );
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) {
    console.log(`[USER MODEL - matchPassword] No stored password found for ${this.email}. Cannot compare.`);
    return false;
  }
  console.log(`[USER MODEL - matchPassword] Comparing:`);
  console.log(`  Entered: ${enteredPassword} (length: ${enteredPassword.length})`);
  console.log(`  Stored : ${this.password.substring(0, 10)}... (length: ${this.password.length})`);
  const isMatch = await bcrypt.compare(enteredPassword, this.password);
  console.log(`[USER MODEL - matchPassword] Comparison result for ${this.email}: ${isMatch}`);
  return isMatch;
};

const User = mongoose.model<IAppUser>('User', UserSchema);

export default User;