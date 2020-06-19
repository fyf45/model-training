// const baseURI = 'https://cowrycare.com/dialectic';
const baseURI = 'http://172.16.97.236:8080';
const APIURI = baseURI + "/data_pre";
const TRAINURI = baseURI + "/train";
const TESTURL = baseURI + "/test";
const MANAGEURL = baseURI + "/data_management";
const APPLICATION = baseURI + "/application";
const API = {
  "baseURI": baseURI,
  getDatalist: APIURI + '/getDatalist',
  getModellist: TRAINURI + "/getModellist",
  getAlgorithm: TRAINURI + "/getAlgorithm",
  generate: APIURI + '/generate',
  preview: APIURI + '/preview',
  dataupdate: APIURI + '/update',
  dataupload: APIURI + '/upload',
  viewdetail:TESTURL + '/view_detail',
  viewupdate:TESTURL + '/update',
  getmanage: MANAGEURL + '/getDatalist',
  getModelDetail: MANAGEURL + '/getModelDetail',
  rm_file: MANAGEURL + '/rm_file'
};

