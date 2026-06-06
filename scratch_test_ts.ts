import handler from './src/api/posts/[id]/index';

const req: any = {
  method: 'GET',
  query: { id: '1' }
};

const res: any = {
  status(code: number) {
    console.log('Status Code:', code);
    return this;
  },
  json(data: any) {
    console.log('Response JSON:', JSON.stringify(data, null, 2));
    return this;
  }
};

handler(req, res)
  .then(() => console.log('Done'))
  .catch(console.error);
