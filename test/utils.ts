import dotenv from "dotenv";

dotenv.config();

export const get_db_options = () => {
  return {
    host: process.env.TEST_HC_HOST,
    port: parseInt(process.env.TEST_HC_PORT),
    user: process.env.TEST_HC_USER,
    password: process.env.TEST_HC_PASSWORD,
    useTLS: true,
  };
};
