import dotenv from "dotenv";
import * as uuid from "uuid";
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

export const random_str = () => {
  return uuid.v4().split("-")[0];
};

export const random_table_name = () => `test_table_${random_str()}z`.toLowerCase();
