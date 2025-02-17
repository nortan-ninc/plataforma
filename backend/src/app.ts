/* eslint-disable import/order */
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import cron from 'node-cron';
import path from 'path';

import { updateIfCurrentPlugin } from './models/shared/versionPlugin';
mongoose.plugin(updateIfCurrentPlugin);

// import logger from 'morgan';
// Import API endpoint routes
import apiRoutes from './routes/api';
import authRoutes from './routes/auth';
import companyRoutes from './routes/company';
import contractRoutes from './routes/contract';
import contractorRoutes from './routes/contractor';
import courseRoutes from './routes/course';
import emailRoutes from './routes/email';
import internalTransactionRoutes from './routes/internalTransaction';
import invoiceRoutes from './routes/invoice';
import notificationRoutes from './routes/notification';
import configRoutes from './routes/platformConfig';
import promotionRoutes from './routes/promotion';
import providerRoutes from './routes/provider';
import publicRoutes from './routes/public';
import teamRoutes from './routes/team';
import transactionRoutes from './routes/transaction';
import userRoutes from './routes/user';
import { SizeLimitedQueue } from './shared/sizeLimitedQueue';
import { createConnection, isUserAuthenticated, mongooseOptions, overdueReceiptNotification } from './shared/util';
import { ChangeStream, ChangeStreamDocument } from 'mongodb';
import CompanyModel, { Company } from './models/company';

class NortanAPI {
  public express;
  public lastChanges: Record<string, SizeLimitedQueue<any>> = {};
  private dbWatchers: Record<string, ChangeStream<any, ChangeStreamDocument<any>>> = {};
  private dbWatchers$;

  constructor() {
    this.express = express();

    // Connect to the database before starting the express application server.
    const connectWithRetry = () => {
      console.log('Trying to connect with database');
      mongoose
        .connect(process.env.MONGODB_URI, mongooseOptions)
        .then(() => {
          this.dbWatchers$ = mongoose.connection.watch();
          console.log('Database connection ready!');
        })
        .catch((error) => {
          console.error('Database connection failed! ', error);
          console.log('Retrying in 2 seconds...');
          setTimeout(connectWithRetry, 2000);
        });
    };

    connectWithRetry();

    mongoose.connection.once('disconnected', () => {
      console.warn('Mongoose has been disconnected');
      connectWithRetry();
    });

    mongoose.set('returnOriginal', false);

    // express.use(logger('dev'));
    this.express.use(compression());
    this.express.use(
      helmet({
        contentSecurityPolicy: false,
      })
    );
    this.express.use(cors());
    this.express.use(express.json({ limit: '50mb' }));
    this.express.use(express.urlencoded({ extended: false, limit: '50mb' }));
    this.express.use('/', express.static(path.join(__dirname, 'angular')));

    // API Public Routes
    this.express.use('/api/public', publicRoutes);
    // API Authentication Routes
    this.express.use('/api/auth', authRoutes);
    // API tooken validation
    this.express.use(isUserAuthenticated);
    // API endpoint routes
    this.express.use('/api/sendmail', emailRoutes);
    this.express.use('/api/user', userRoutes);
    this.express.use('/api/contractor', contractorRoutes);
    this.express.use('/api/contract', contractRoutes);
    this.express.use('/api/invoice', invoiceRoutes);
    this.express.use('/api/promotion', promotionRoutes);
    this.express.use('/api/team', teamRoutes);
    this.express.use('/api/course', courseRoutes);
    this.express.use('/api/config', configRoutes);
    this.express.use('/api/notify', notificationRoutes);
    this.express.use('/api/transaction/internal', internalTransactionRoutes);
    this.express.use('/api/transaction', transactionRoutes);
    this.express.use('/api/provider', providerRoutes);
    this.express.use('/api/company', companyRoutes);

    this.express.use('/api', apiRoutes);

    // For all GET requests, send back index.html
    // so that PathLocationStrategy can be used
    this.express.get('/*', function (req, res) {
      res.sendFile(path.join(__dirname, '/angular/index.html'));
    });

    cron.schedule(
      '0 00 07 * * *',
      () => {
        overdueReceiptNotification();
      },
      {
        scheduled: true,
        timezone: 'America/Sao_Paulo',
      }
    );
  }

  async setCompanyDbWatcher(companyId: string): Promise<void> {
    if (!this.lastChanges[companyId]) {
      this.lastChanges[companyId] = new SizeLimitedQueue<any>(10000);
    }
    if (!this.dbWatchers[companyId]) {
      const company: Company = await CompanyModel.findById(companyId);
      const connection = createConnection(company);
      this.dbWatchers[companyId] = connection.watch();
      this.dbWatchers[companyId].on('change', (data) => api.lastChanges[companyId].queue(data));
      this.dbWatchers$.on('change', (data) => api.lastChanges[companyId].queue(data));
    }
  }
}

const api = new NortanAPI();

export default { api: api, db: mongoose.connection };
