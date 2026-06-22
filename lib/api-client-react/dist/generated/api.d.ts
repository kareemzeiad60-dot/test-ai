import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { AnalysesStats, Analysis, AuthUserEnvelope, BeginBrowserLoginParams, BreedCount, CreateAnalysisBody, DeleteResult, ErrorEnvelope, HandleBrowserLoginCallbackParams, HealthStatus, ListAnalysesParams, LogoutSuccess, MobileTokenExchangeRequest, MobileTokenExchangeSuccess } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get the currently authenticated user
 */
export declare const getGetCurrentAuthUserUrl: () => string;
export declare const getCurrentAuthUser: (options?: RequestInit) => Promise<AuthUserEnvelope>;
export declare const getGetCurrentAuthUserQueryKey: () => readonly ["/api/auth/user"];
export declare const getGetCurrentAuthUserQueryOptions: <TData = Awaited<ReturnType<typeof getCurrentAuthUser>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCurrentAuthUserQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentAuthUser>>>;
export type GetCurrentAuthUserQueryError = ErrorType<unknown>;
/**
 * @summary Get the currently authenticated user
 */
export declare function useGetCurrentAuthUser<TData = Awaited<ReturnType<typeof getCurrentAuthUser>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Start the browser OIDC login flow
 */
export declare const getBeginBrowserLoginUrl: (params?: BeginBrowserLoginParams) => string;
export declare const beginBrowserLogin: (params?: BeginBrowserLoginParams, options?: RequestInit) => Promise<unknown>;
export declare const getBeginBrowserLoginQueryKey: (params?: BeginBrowserLoginParams) => readonly ["/api/login", ...BeginBrowserLoginParams[]];
export declare const getBeginBrowserLoginQueryOptions: <TData = Awaited<ReturnType<typeof beginBrowserLogin>>, TError = ErrorType<void>>(params?: BeginBrowserLoginParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof beginBrowserLogin>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof beginBrowserLogin>>, TError, TData> & {
    queryKey: QueryKey;
};
export type BeginBrowserLoginQueryResult = NonNullable<Awaited<ReturnType<typeof beginBrowserLogin>>>;
export type BeginBrowserLoginQueryError = ErrorType<void>;
/**
 * @summary Start the browser OIDC login flow
 */
export declare function useBeginBrowserLogin<TData = Awaited<ReturnType<typeof beginBrowserLogin>>, TError = ErrorType<void>>(params?: BeginBrowserLoginParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof beginBrowserLogin>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Complete the browser OIDC login flow
 */
export declare const getHandleBrowserLoginCallbackUrl: (params?: HandleBrowserLoginCallbackParams) => string;
export declare const handleBrowserLoginCallback: (params?: HandleBrowserLoginCallbackParams, options?: RequestInit) => Promise<unknown>;
export declare const getHandleBrowserLoginCallbackQueryKey: (params?: HandleBrowserLoginCallbackParams) => readonly ["/api/callback", ...HandleBrowserLoginCallbackParams[]];
export declare const getHandleBrowserLoginCallbackQueryOptions: <TData = Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError = ErrorType<void>>(params?: HandleBrowserLoginCallbackParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HandleBrowserLoginCallbackQueryResult = NonNullable<Awaited<ReturnType<typeof handleBrowserLoginCallback>>>;
export type HandleBrowserLoginCallbackQueryError = ErrorType<void>;
/**
 * @summary Complete the browser OIDC login flow
 */
export declare function useHandleBrowserLoginCallback<TData = Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError = ErrorType<void>>(params?: HandleBrowserLoginCallbackParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof handleBrowserLoginCallback>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Clear the session and begin OIDC logout
 */
export declare const getLogoutBrowserSessionUrl: () => string;
export declare const logoutBrowserSession: (options?: RequestInit) => Promise<unknown>;
export declare const getLogoutBrowserSessionQueryKey: () => readonly ["/api/logout"];
export declare const getLogoutBrowserSessionQueryOptions: <TData = Awaited<ReturnType<typeof logoutBrowserSession>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof logoutBrowserSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof logoutBrowserSession>>, TError, TData> & {
    queryKey: QueryKey;
};
export type LogoutBrowserSessionQueryResult = NonNullable<Awaited<ReturnType<typeof logoutBrowserSession>>>;
export type LogoutBrowserSessionQueryError = ErrorType<void>;
/**
 * @summary Clear the session and begin OIDC logout
 */
export declare function useLogoutBrowserSession<TData = Awaited<ReturnType<typeof logoutBrowserSession>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof logoutBrowserSession>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Exchange a mobile OIDC code for a session token
 */
export declare const getExchangeMobileAuthorizationCodeUrl: () => string;
export declare const exchangeMobileAuthorizationCode: (mobileTokenExchangeRequest: MobileTokenExchangeRequest, options?: RequestInit) => Promise<MobileTokenExchangeSuccess>;
export declare const getExchangeMobileAuthorizationCodeMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
        data: BodyType<MobileTokenExchangeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
    data: BodyType<MobileTokenExchangeRequest>;
}, TContext>;
export type ExchangeMobileAuthorizationCodeMutationResult = NonNullable<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>>;
export type ExchangeMobileAuthorizationCodeMutationBody = BodyType<MobileTokenExchangeRequest>;
export type ExchangeMobileAuthorizationCodeMutationError = ErrorType<ErrorEnvelope>;
/**
 * @summary Exchange a mobile OIDC code for a session token
 */
export declare const useExchangeMobileAuthorizationCode: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
        data: BodyType<MobileTokenExchangeRequest>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
    data: BodyType<MobileTokenExchangeRequest>;
}, TContext>;
/**
 * @summary Delete a mobile session token
 */
export declare const getLogoutMobileSessionUrl: () => string;
export declare const logoutMobileSession: (options?: RequestInit) => Promise<LogoutSuccess>;
export declare const getLogoutMobileSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
export type LogoutMobileSessionMutationResult = NonNullable<Awaited<ReturnType<typeof logoutMobileSession>>>;
export type LogoutMobileSessionMutationError = ErrorType<unknown>;
/**
 * @summary Delete a mobile session token
 */
export declare const useLogoutMobileSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
/**
 * @summary List all analyses for current user
 */
export declare const getListAnalysesUrl: (params?: ListAnalysesParams) => string;
export declare const listAnalyses: (params?: ListAnalysesParams, options?: RequestInit) => Promise<Analysis[]>;
export declare const getListAnalysesQueryKey: (params?: ListAnalysesParams) => readonly ["/api/analyses", ...ListAnalysesParams[]];
export declare const getListAnalysesQueryOptions: <TData = Awaited<ReturnType<typeof listAnalyses>>, TError = ErrorType<ErrorEnvelope>>(params?: ListAnalysesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnalyses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAnalyses>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAnalysesQueryResult = NonNullable<Awaited<ReturnType<typeof listAnalyses>>>;
export type ListAnalysesQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary List all analyses for current user
 */
export declare function useListAnalyses<TData = Awaited<ReturnType<typeof listAnalyses>>, TError = ErrorType<ErrorEnvelope>>(params?: ListAnalysesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAnalyses>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Submit a cattle image for breed analysis
 */
export declare const getCreateAnalysisUrl: () => string;
export declare const createAnalysis: (createAnalysisBody: CreateAnalysisBody, options?: RequestInit) => Promise<Analysis>;
export declare const getCreateAnalysisMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnalysis>>, TError, {
        data: BodyType<CreateAnalysisBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAnalysis>>, TError, {
    data: BodyType<CreateAnalysisBody>;
}, TContext>;
export type CreateAnalysisMutationResult = NonNullable<Awaited<ReturnType<typeof createAnalysis>>>;
export type CreateAnalysisMutationBody = BodyType<CreateAnalysisBody>;
export type CreateAnalysisMutationError = ErrorType<ErrorEnvelope>;
/**
 * @summary Submit a cattle image for breed analysis
 */
export declare const useCreateAnalysis: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnalysis>>, TError, {
        data: BodyType<CreateAnalysisBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAnalysis>>, TError, {
    data: BodyType<CreateAnalysisBody>;
}, TContext>;
/**
 * @summary Get dashboard statistics for current user
 */
export declare const getGetAnalysesStatsUrl: () => string;
export declare const getAnalysesStats: (options?: RequestInit) => Promise<AnalysesStats>;
export declare const getGetAnalysesStatsQueryKey: () => readonly ["/api/analyses/stats"];
export declare const getGetAnalysesStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAnalysesStats>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalysesStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnalysesStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnalysesStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAnalysesStats>>>;
export type GetAnalysesStatsQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary Get dashboard statistics for current user
 */
export declare function useGetAnalysesStats<TData = Awaited<ReturnType<typeof getAnalysesStats>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalysesStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get breed frequency statistics for all user analyses
 */
export declare const getGetBreedStatsUrl: () => string;
export declare const getBreedStats: (options?: RequestInit) => Promise<BreedCount[]>;
export declare const getGetBreedStatsQueryKey: () => readonly ["/api/analyses/breed-stats"];
export declare const getGetBreedStatsQueryOptions: <TData = Awaited<ReturnType<typeof getBreedStats>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBreedStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBreedStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBreedStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getBreedStats>>>;
export type GetBreedStatsQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary Get breed frequency statistics for all user analyses
 */
export declare function useGetBreedStats<TData = Awaited<ReturnType<typeof getBreedStats>>, TError = ErrorType<ErrorEnvelope>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBreedStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get a single analysis by ID
 */
export declare const getGetAnalysisUrl: (id: number) => string;
export declare const getAnalysis: (id: number, options?: RequestInit) => Promise<Analysis>;
export declare const getGetAnalysisQueryKey: (id: number) => readonly [`/api/analyses/${number}`];
export declare const getGetAnalysisQueryOptions: <TData = Awaited<ReturnType<typeof getAnalysis>>, TError = ErrorType<ErrorEnvelope>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalysis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnalysis>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnalysisQueryResult = NonNullable<Awaited<ReturnType<typeof getAnalysis>>>;
export type GetAnalysisQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary Get a single analysis by ID
 */
export declare function useGetAnalysis<TData = Awaited<ReturnType<typeof getAnalysis>>, TError = ErrorType<ErrorEnvelope>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnalysis>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Delete an analysis
 */
export declare const getDeleteAnalysisUrl: (id: number) => string;
export declare const deleteAnalysis: (id: number, options?: RequestInit) => Promise<DeleteResult>;
export declare const getDeleteAnalysisMutationOptions: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAnalysis>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAnalysis>>, TError, {
    id: number;
}, TContext>;
export type DeleteAnalysisMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAnalysis>>>;
export type DeleteAnalysisMutationError = ErrorType<ErrorEnvelope>;
/**
 * @summary Delete an analysis
 */
export declare const useDeleteAnalysis: <TError = ErrorType<ErrorEnvelope>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAnalysis>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAnalysis>>, TError, {
    id: number;
}, TContext>;
/**
 * @summary Get breed distribution for a specific analysis
 */
export declare const getGetBreedDistributionUrl: (id: number) => string;
export declare const getBreedDistribution: (id: number, options?: RequestInit) => Promise<BreedCount[]>;
export declare const getGetBreedDistributionQueryKey: (id: number) => readonly [`/api/analyses/${number}/breed-distribution`];
export declare const getGetBreedDistributionQueryOptions: <TData = Awaited<ReturnType<typeof getBreedDistribution>>, TError = ErrorType<ErrorEnvelope>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBreedDistribution>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getBreedDistribution>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetBreedDistributionQueryResult = NonNullable<Awaited<ReturnType<typeof getBreedDistribution>>>;
export type GetBreedDistributionQueryError = ErrorType<ErrorEnvelope>;
/**
 * @summary Get breed distribution for a specific analysis
 */
export declare function useGetBreedDistribution<TData = Awaited<ReturnType<typeof getBreedDistribution>>, TError = ErrorType<ErrorEnvelope>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getBreedDistribution>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map