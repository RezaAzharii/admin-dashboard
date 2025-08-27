const BASE_URL = "http://127.0.0.1:8000/api";

const API = {
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
    LOGOUT: `${BASE_URL}/logout`,
    USER: `${BASE_URL}/user`,
    REGISTER: `${BASE_URL}/register`,
  },
  USERS: {
  INDEX: `${BASE_URL}/petugas-pasar`,                
  SHOW: (id) => `${BASE_URL}/user/${id}`,    
  UPDATE: (id) => `${BASE_URL}/user/${id}`,  
  DELETE: (id) => `${BASE_URL}/user/${id}`,  
},
  BAHAN_POKOK: {
    INDEX: `${BASE_URL}/bahan-pokok`,
    SHOW: (id) => `${BASE_URL}/bahan-pokok/${id}`,
    STORE: `${BASE_URL}/bahan-pokok`,
    UPDATE: (id) => `${BASE_URL}/bahan-pokok/${id}`,
    DELETE: (id) => `${BASE_URL}/bahan-pokok/${id}`,
  },
  PASAR: {
    INDEX: `${BASE_URL}/pasar`,
    STORE: `${BASE_URL}/pasar`,
    UPDATE: (id) => `${BASE_URL}/pasar/${id}`,
    DELETE: (id) => `${BASE_URL}/pasar/${id}`,
  },
  HARGA_BAPOK: {
    INDEX: `${BASE_URL}/harga-bapok`,
    TABLE:`${BASE_URL}/harga-bapok-table`,
    STORE: `${BASE_URL}/harga-bapok`,
    UPDATE: (id) => `${BASE_URL}/harga-bapok/${id}`,
    DELETE: (id) => `${BASE_URL}/harga-bapok/${id}`,
  },
};

export default API;
