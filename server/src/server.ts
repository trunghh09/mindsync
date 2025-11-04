/**
 ** Node modules
 */
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

/**
 ** Custom modules
 */
import { config } from '@/config';
import { limiter } from '@/lib';
import mindSyncRoute from '@/routes';

/**
 ** Types
 */
import type { CorsOptions } from 'cors';

/**
 **  Express app initial
 */
const app = express();

/**
 ** Configure CORS options
 */
const corOptions: CorsOptions = {
    origin(origin, callback) {
        if (
            config.NODE_ENV === 'development' ||
            !origin ||
            config.WHITELIST_ORIGINS.includes(origin)
        ) {
            callback(null, true);
        } else {
            // Reject requests from non-whitelisted origins
            callback(
                new Error(`CORS Error: ${origin} is not allowed by CORS`),
                false,
            );
            console.log(`CORS Error: ${origin} is not allowed by CORS`);
        }
    },
};

/**
 ** Apply core middleware
 */
app.use(cors(corOptions));

/**
 ** Enable JSON request body parsing
 */
app.use(express.json());

/**
 ** Enable URL-encoded request body parsing with extended mode
 ** `extended: true` allows rich objects and arrays via querystring library
 */
app.use(express.urlencoded({ extended: true }));

/**
 ** Enable cookie parser middleware
 */
app.use(cookieParser());

/**
 ** Enable response compression to reduce payload size and improve performance
 */
app.use(
    compression({
        threshold: 1024, // Only compress responses larger than 1KB,
    }),
);

/**
 ** Use Helmet to enhance security by setting various HTTP headers
 */
app.use(helmet());

/**
 ** Apply rate limitting middleware to prevent excessive requests and enhance security
 */
app.use(limiter);

/**
 ** Immediately Invoked Async Function Expression (IIFE) to start the server.
 *
 ** - Tries to connect to the database before initializing the server.
 ** - Defines the API route (`/apu/version`).
 ** - Starts the server on the specified PORT and logs the running URL.
 ** - If an error occurs during startup, it is logged and the process exits with status 1.
 */
(async () => {
    try {
        /**
         ** Apply routes application
         */
        mindSyncRoute(app);

        app.listen(config.PORT, () => {
            console.log(`Server is running on port ${config.PORT}`);
        });
    } catch (error) {
        console.log('Failed to start the server', error);

        if (config.NODE_ENV === 'production') {
            process.exit(1);
        }
    }
})();

/**
 ** Handles server shutdown gracefully by disconnecting from database.
 *
 ** - Attempts to disconnect from the database before shutting down the server.
 ** - Logs a success message if the disconnection is successful.
 ** - If an error occurs during disconnection, it is logged to the console.
 ** - Exists the process with status code `0` (indicating a successful shutdown).
 */
const handleServerShutdown = async () => {
    try {
        console.log('Server SHUTDOWN');
        process.exit(0);
    } catch (error) {
        console.log('Error during server shutdown', error);
    }
};

/**
 ** Listens for termination signals (`SIGTERM` and `SIGINT`)
 *
 ** - `SIGTERM` is typically sent when stopping a process (e.g., `kill` command or container shutdown).
 ** - `SIGINT` is triggered when the user interrupts the process (e.g., pressing `Crtl + C`).
 ** - When either signal is received, `handleServerShutdown` is executed to ensure proper cleanup.
 */
process.on("SIGTERM", handleServerShutdown);
process.on("SIGINT", handleServerShutdown);