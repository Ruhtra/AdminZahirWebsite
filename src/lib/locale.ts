// import axios from "axios";

// // function createUrl(params) {
// //     const queryString = Object.keys(params)
// //         .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
// //         .join('&');
// //     return `https://example.com?${queryString}`;
// // }
// // const key = process.env.KEYGOOGLE;

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export async function getLocaleByCep(cep: string): Promise<any> {
//   try {
//     const data = await getLocalByCep_viacep(cep);

//     const response_lat_log = await getLatLngOpenStreetMap({
//       logradouro: data.logradouro,
//       bairro: data.bairro,
//       localidade: data.localidade,
//       uf: data.uf,
//       cep: data.cep,
//       pais: "Brasil",
//     });

//     return response_lat_log;
//   } catch (error) {
//     // try {
//     console.log("ERRO Nº 1");
//     console.log(error);

//     // const response_lat_log = await getLocalByCep_google(cep);
//     // return response_lat_log;
//     // } catch (error2) {
//     // console.log("ERRO Nº 2");
//     // console.log(error2);

//     throw new Error("Não foi possivel obter a localidade especificada");
//     // }
//   }
// }

// // async function getLatLng(address: any) {
// //   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address.logradouro} - ${address.bairro}, ${address.localidade} - ${address.uf}, ${address.cep}, ${address.pais}&key=${key}`;

// //   const response_lat_log = await axios.get(url);
// //   if (response_lat_log.status <= 200 && response_lat_log.status > 300)
// //     throw new Error(`Erro ao consumir API do Google Maps`);
// //   if (response_lat_log.data.results.length <= 0)
// //     throw new Error("Não foi possivel encontrar a localidade específicado");

// //   return response_lat_log.data.results[0].geometry.location;
// // }

// // exemploretorno
// // {
// //     "cep": "59135-620",
// //     "logradouro": "Rua Bariri",
// //     "complemento": "",
// //     "unidade": "",
// //     "bairro": "Lagoa Azul",
// //     "localidade": "Natal",
// //     "uf": "RN",
// //     "ibge": "2408102",
// //     "gia": "",
// //     "ddd": "84",
// //     "siafi": "1761"
// // }

// export async function getLocalByCep_viacep(cep: string) {
//   const url = `https://viacep.com.br/ws/${cep}/json/`;

//   const response = await axios.get(url);

//   if (response.status <= 200 && response.status > 300)
//     throw new Error(`Erro ao consumir API do Via Cep`);
//   if (response.data.erro != undefined)
//     throw new Error("Não foi possivel encontrar o cep específicado");

//   return response.data;
// }

// // async function getLocalByCep_google(cep: string) {
// //   const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${cep}&key=${key}`;

// //   const response_lat_log = await axios.get(url);
// //   if (response_lat_log.status <= 200 && response_lat_log.status > 300)
// //     throw new Error(`Erro ao consumir API do Google Maps`);
// //   if (response_lat_log.data.results.length <= 0)
// //     throw new Error("Não foi possivel encontrar o cep específicado");

// //   return response_lat_log.data.results[0].geometry.location;
// // }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function getLatLngOpenStreetMap(address: any) {
//   const query = `${address.logradouro}, ${address.bairro}, ${address.localidade}, ${address.uf}, Brasil`;
//   const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

//   const response = await axios.get(url, {
//     headers: {
//       'User-Agent': 'YourApp/1.0' // Nominatim requer User-Agent
//     }
//   });

//   if (response.status < 200 || response.status >= 300 || response.data.length === 0) {
//     throw new Error("Não foi possível encontrar a localidade");
//   }

//   return {
//     lat: parseFloat(response.data[0].lat),
//     lng: parseFloat(response.data[0].lon)
//   };
// }
