import bcrypt from "bcryptjs";

// Hash password before saving
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (
  inputPassword: string,
  storedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(inputPassword, storedPassword);
};
