import type { Address } from '@solana/addresses';
import type { Decoder } from '@solana/codecs-core';
import type {
    AccountInfoBase,
    AccountInfoWithBase58Bytes,
    AccountInfoWithBase58EncodedData,
    AccountInfoWithBase64EncodedData,
    RpcResponse,
    U64UnsafeBeyond2Pow53Minus1,
} from '@solana/rpc-core/dist/types/rpc-methods/common';
import type { GetAccountInfoApi } from '@solana/rpc-core/dist/types/rpc-methods/getAccountInfo';
import type { GetMultipleAccountsApi } from '@solana/rpc-core/dist/types/rpc-methods/getMultipleAccounts';
import type { PendingRpcRequest, Rpc } from '@solana/rpc-transport/dist/types/json-rpc-types';

export type Base64RpcAccount = AccountInfoBase & AccountInfoWithBase64EncodedData;
export type Base58RpcAccount = AccountInfoBase & (AccountInfoWithBase58Bytes | AccountInfoWithBase58EncodedData);
export type JsonParsedRpcAccount = AccountInfoBase & Readonly<{ data: JsonParsedData<unknown> }>;
export type JsonParsedData<TData> = Readonly<{
    program: string;
    parsed: { info: TData; type: string };
    space: U64UnsafeBeyond2Pow53Minus1;
}>;

export function getMockRpc(
    accounts: Record<Address, Base64RpcAccount | JsonParsedRpcAccount>,
): Rpc<GetAccountInfoApi | GetMultipleAccountsApi> & { getAccountInfo: jest.Mock; getMultipleAccounts: jest.Mock } {
    const wrapInPendingResponse = <T>(value: T): PendingRpcRequest<RpcResponse<T>> => {
        const send = jest.fn().mockResolvedValue({ context: { slot: 0n }, value });
        return { send };
    };

    const getAccountInfo = jest
        .fn()
        .mockImplementation((address: Address) => wrapInPendingResponse(accounts[address] ?? null));

    const getMultipleAccounts = jest
        .fn()
        .mockImplementation((addresses: Address[]) =>
            wrapInPendingResponse(addresses.map(address => accounts[address] ?? null)),
        );

    return { getAccountInfo, getMultipleAccounts };
}

export function getMockDecoder<T>(mockValue: T): Decoder<T> {
    return {
        decode: jest.fn().mockReturnValueOnce(mockValue),
        read: jest.fn().mockReturnValueOnce([mockValue, 42]),
    } as Decoder<T>;
}
