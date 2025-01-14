import * as otpGenerator from 'otp-generator';

export const generateOtp = (length: number = 6): string => {
  return otpGenerator.generate(length.toString(), {
    upperCase: false,
    specialChars: false,
    digits: true,
  });
};
