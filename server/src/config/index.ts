/**
 **  Node modules
 */
import dotenv from 'dotenv';

dotenv.config();

export const config = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV,
    WHITELIST_ORIGINS: process.env.NODE_ORIGIN
        ? ['http://localhost:5173', process.env.NODE_ORIGIN]
        : ['http://localhost:5173'],
};
