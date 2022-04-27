import * as express from 'express';
import UserModel from '../models/user';
import { UserNotification } from '../models/user';
import { Mutex } from 'async-mutex';
import { usersMap } from '../shared/global';
import { cloneDeep, isEqual } from 'lodash';

const router = express.Router();
const mutex = new Mutex();
let lastNotification: UserNotification;

function updateNotification(notification: UserNotification, res: any) {
  UserModel.findByIdAndUpdate(
    (notification.to as any)._id,
    { $push: { notifications: notification } },
    { upsert: false },
    (err, savedUser) => {
      if (err) {
        return res.status(500).json({
          message: res.req.url === '/' ? 'Erro ao enviar notificação!' : 'Erro ao enviar notificações!',
          error: err,
        });
      }
      if (Object.keys(usersMap).length > 0) usersMap[(notification.to as any)._id] = cloneDeep(savedUser.toJSON());
      if (isEqual(notification, lastNotification)) {
        return res
          .status(200)
          .json({ message: res.req.url === '/' ? 'Notificação enviada!' : 'Notificações enviadas!' });
      }
    }
  );
}

router.post('/', (req, res, next) => {
  mutex.acquire().then((release) => {
    lastNotification = req.body.notification;
    updateNotification(req.body.notification, res);
    release();
  });
});

router.post('/many', (req, res, next) => {
  mutex.acquire().then((release) => {
    lastNotification = req.body.notifications[req.body.notifications.length - 1];
    req.body.notifications.forEach((notification) => {
      updateNotification(notification, res);
    });
    release();
  });
});

router.post('/read', (req, res, next) => {
  mutex.acquire().then((release) => {
    UserModel.findByIdAndUpdate(
      { _id: req.body.notification.to },
      { $pull: { notifications: { _id: req.body.notification._id } } },
      { safe: true, multi: false },
      (err, savedUser) => {
        if (err) {
          return res.status(500).json({
            message: 'Falha ao ler notificação!',
            error: err,
          });
        }
        if (Object.keys(usersMap).length > 0)
          usersMap[(req.body.notification.to as any)._id] = cloneDeep(savedUser.toJSON());
        if (isEqual(req.body.notification, lastNotification)) {
          return res.status(200).json({ message: 'Notificação marcada como lida!' });
        }
      }
    );
    release();
  });
});

export default router;
