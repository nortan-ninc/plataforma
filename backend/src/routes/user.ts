import * as express from 'express';

import ProspectModel, { Prospect } from '../models/prospect';
import ProspectRefModel from '../models/prospectRef';
import UserModel, { User } from '../models/user';
import UserRefModel, { UserRef } from '../models/userRef';
import { getModelForCompany } from '../shared/util';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const companyId = req.headers.companyid as string;
    const userCompanyModel = await getModelForCompany(companyId, UserModel);
    const user = new userCompanyModel(req.body.user);
    await user.save();
    return res.status(201).json({
      message: 'Associado cadastrado!',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao cadastrar associado!',
      error: err,
    });
  }
});

router.post('/update', async (req, res, next) => {
  try {
    const companyId = req.headers.companyid as string;
    const userCompanyModel = await getModelForCompany(companyId, UserModel);
    await userCompanyModel.findByIdAndUpdate(req.body.user._id, req.body.user, { upsert: false });
    return res.status(200).json({
      message: 'Associado Atualizado!',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao atualizar associado!',
      error: err,
    });
  }
});

router.post('/all', async (req, res) => {
  try {
    const companyId = req.headers.companyid as string;
    const userCompanyModel = await getModelForCompany(companyId, UserModel);
    const users: User[] = await userCompanyModel.find({});
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao buscar associados!',
      error: err,
    });
  }
});

router.post('/allProspects', async (req, res) => {
  try {
    const companyId = req.headers.companyid as string;
    const prospectCompanyModel = await getModelForCompany(companyId, ProspectModel);
    const prospects: Prospect[] = await prospectCompanyModel.find({});
    return res.status(200).json(prospects);
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao buscar prospectos!',
      error: err,
    });
  }
});

router.delete('/approveProspect', async (req, res, next) => {
  try {
    const companyId = req.headers.companyid as string;
    const userCompanyModel = await getModelForCompany(companyId, UserModel);

    const newUserRef: UserRef = {
      _id: req.body.prospect._id,
      email: req.body.prospect.email,
      company: req.body.prospect.company,
      active: req.body.prospect.active,
    };
    const userRef = new UserRefModel(newUserRef);
    await userRef.save();

    const newUser: User = req.body.prospect;
    newUser._id = newUser._id;
    const user = new userCompanyModel(newUser);
    await user.save();

    await ProspectRefModel.findByIdAndDelete(req.body.prospect._id);
    return res.status(201).json({
      message: 'Prospecto aprovado com sucesso!',
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Erro ao criar novo usuário!',
      error: err,
    });
  }
});

export default router;
