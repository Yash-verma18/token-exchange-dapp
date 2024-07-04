interface Ethereum {
  request: ({
    method,
    params,
  }: {
    method: string;
    params?: any[];
  }) => Promise<void>;
  on: (event: string, handler: (accounts: string[]) => void) => void;
}

interface Window {
  ethereum?: Ethereum;
}
