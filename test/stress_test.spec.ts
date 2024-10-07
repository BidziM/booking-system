import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '5s', target: 40 },
    { duratiom: '10s', target: 20 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/performance');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
