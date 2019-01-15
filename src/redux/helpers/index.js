import { ENDPOINT } from '../../utils/Constant';

export function findParam(param) {
  const params = new URLSearchParams(document.location.search.substring(1));
  return params.get(param);
}
export const buildUrl = (url:string, params?:string) => {
  return ENDPOINT.BASE_URL
    .concat(url)
    .concat('?')
    .concat(params);
};
