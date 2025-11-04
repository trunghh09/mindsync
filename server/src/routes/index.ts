/**
 ** Node modules
 */
import { Express } from 'express';

/**
 ** Custom modules
 */
import { AuthRoute } from './v1';

const mindSyncRoute = (app: Express) => {
    app.use('/health', (req, res) => {
        return res.send({
            status: true,
            message: 'MindSync is OK!',
        });
    });

    app.use('/api/v1', AuthRoute);
};

export default mindSyncRoute;
