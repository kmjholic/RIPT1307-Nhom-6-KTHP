process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3307';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '2542006';
process.env.DB_NAME = 'edu_forum';
process.env.NODE_ENV = 'development';

const mod = require('C:/Users/ACER/Documents/TH-LTW kì 2-năm 2/RIPT1307-Nhom-6-KTHP/api/posts/[id]/index.js');
const handler = mod.default;

const req = {
  method: 'GET',
  query: { id: '1' },
  headers: {},
  on(event, cb) {
    if (event === 'end') {
      process.nextTick(cb);
    }
  }
};

const res = {
  status(code) {
    console.log('Status Code:', code);
    return this;
  },
  json(data) {
    console.log('Response JSON:', JSON.stringify(data, null, 2));
    return this;
  }
};

handler(req, res)
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
