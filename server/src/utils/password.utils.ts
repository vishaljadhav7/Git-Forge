
import bcrypt from 'bcrypt';
import { InternalServerError } from './error.utils';


export const hashPassword = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new InternalServerError('Error hashing password');
  }
};


export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new InternalServerError('Error comparing passwords');
  }
};

