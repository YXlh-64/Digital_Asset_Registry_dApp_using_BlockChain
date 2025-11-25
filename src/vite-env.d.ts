/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ADDRESS: string;
  readonly VITE_PINATA_API_KEY: string;
  readonly VITE_PINATA_SECRET_KEY: string;
  readonly VITE_WEB3_STORAGE_TOKEN: string;
  readonly VITE_INFURA_PROJECT_ID: string;
  readonly VITE_INFURA_PROJECT_SECRET: string;
  readonly VITE_NETWORK_NAME: string;
  readonly VITE_CHAIN_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
