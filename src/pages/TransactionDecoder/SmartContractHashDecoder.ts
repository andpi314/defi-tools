import { ethers } from "ethers";

export interface IDecodedElement {
  key: string;
  value: string;
  method: string;
}

export interface ITransactionDescription {
  args: (ethers.BigNumber | string)[];
  hash: string;
  elements: IDecodedElement[];
  method: string;
}

export class SmartContractToolkit {
  private readonly contractIFace: ethers.utils.Interface;
  constructor(abi: string) {
    this.contractIFace = new ethers.utils.Interface(abi);
  }
  // ################## GETTER ##################
  get contract() {
    return this.contractIFace;
  }
  // ################## GETTER ##################

  // ################## UTILS ##################
  /**
   * Function to parse a buffer into a string compatible with bytes32 and bytes solidity format
   * (useful to call smart contracts functions)
   *
   * @param {Buffer} buffer A buffer of bytes
   * @returns {string} hex string of the buffer
   */
  public bufferToHex(buffer: Buffer): string {
    return ethers.utils.hexlify(buffer);
  }
  // ################## UTILS ##################

  /**
   * * When you:
   * - DO know the data hash of the transaction
   * - DO know the ABI of the smart contract called
   * - DO NOT know the name of the method called
   * ! Not sure if it works with complex payload (i.e. with data passed to the method)
   *
   * @param {String} payloadHash
   * @returns
   */
  private getTransactionDescription(
    payloadHash: string
  ): ethers.utils.TransactionDescription {
    return this.contractIFace.parseTransaction({ data: payloadHash });
  }

  /**
   * * When you:
   * - DO know the data hash of the transaction
   * - DO know the ABI of the smart contract called
   * - DO know the name of the method of the smart contract called
   * - DO NOT know the raw data passed as input (e.g. Amount and other parameters)
   *
   * @param {string} name
   * @param {string} payload
   * @returns
   */
  public decodeTransactionPayload(
    name: string,
    payload: string
  ): ethers.utils.Result {
    return this.contractIFace.decodeFunctionData(name, payload);
  }

  public decodeMultiCall(multicallEncoded: string): ITransactionDescription[] {
    const decoded = this.getTransactionDescription(multicallEncoded);
    return decoded.args.data.map((hash: string) => {
      const dec = this.getTransactionDescription(hash);

      const method = dec.functionFragment.name;

      // const decoded = uniRouter.interface.decodeFunctionData(
      //   dec.functionFragment.name,
      //   hash
      // )

      const json: { [methodName: string]: { [param: string]: string } } = {};

      const elements: { key: string; value: string; method: string }[] = [];

      Object.entries(dec.args.params || dec.args).map(([key, value]) => {
        // Due to mixed types in the array, we need to perform this shallow filter in order to avoid repeating the same key
        if (!isNaN(parseInt(key))) return;

        const typeSafeValue = value as any;
        elements.push({
          key,
          value: typeSafeValue.toString(),
          method,
        });

        json[method] = {
          ...(json[method] || {}),
          [key]: typeSafeValue.toString(),
        };
      });

      return {
        hash,
        method,
        elements,
        args: dec.args.params
          ? dec.args.params
          : //    dec.args.map((arg) => {
            //     if (arg.params) {
            //       return arg.params
            //     }
            //     return arg
            //   })
            dec.args,
      };
    });
  }
}
