import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type account = {
    id: Generated<string>;
    userId: string;
    accountId: string;
    providerId: string;
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpiresAt: Timestamp | null;
    refreshTokenExpiresAt: Timestamp | null;
    scope: string | null;
    idToken: string | null;
    password: string | null;
};
export type document = {
    id: Generated<string>;
    ownerId: string;
    title: string;
};
export type session = {
    id: Generated<string>;
    userId: string;
    token: string;
    expiresAt: Timestamp;
    ipAddress: string | null;
    userAgent: string | null;
};
export type user = {
    id: Generated<string>;
    email: string;
    emailVerified: Generated<boolean>;
    name: string;
    image: string | null;
    isAnonymous: Generated<boolean>;
};
export type verification = {
    id: Generated<string>;
    identifier: string;
    token: string | null;
    expiresAt: Timestamp;
};
export type DB = {
    account: account;
    document: document;
    session: session;
    user: user;
    verification: verification;
};
