import api from './api';
import app from './app';
import chain from './chain';
import * as features from './features';
import opengraph from './opengraph';
import services from './services';
import UI from './ui';

const config = Object.freeze({
  app,
  chain,
  api,
  UI,
  features,
  services,
  opengraph,
});

export default config;
