import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://vestrs-production.up.railway.app/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// We import the store lazily to avoid circular dependency
let getAccessToken: () => string | null = () => null;
let getRefreshToken: () => string | null = () => null;
let setTokensFn: (access: string, refresh: string) => void = () => {};
let logoutFn: () => void = () => {};

export function initApiClient(
  getAccess: () => string | null,
  getRefresh: () => string | null,
  setTokens: (access: string, refresh: string) => void,
  logout: () => void
) {
  getAccessToken = getAccess;
  getRefreshToken = getRefresh;
  setTokensFn = setTokens;
  logoutFn = logout;
}

// Request interceptor: attach access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.log(`[API] ERROR code=${error.code} status=${error.response?.status} msg=${error.message}`);
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        logoutFn();
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data.data;
        // Refresh endpoint only returns a new access_token — preserve existing refresh_token
        setTokensFn(access_token, refreshToken);

        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logoutFn();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_TAKEN: 'This email is already registered',
  INVALID_CREDENTIALS: 'Incorrect email or password',
  STEP_NOT_ALLOWED: 'Complete the previous step first',
  KYC_ALREADY_PENDING: 'Verification already in progress',
  MAX_ATTEMPTS_REACHED: 'Maximum attempts reached. Contact support',
  INSUFFICIENT_FUNDS: 'Insufficient balance in selected account',
  BANK_LINK_FAILED: 'Bank connection failed. Try a different token',
  ACCRED_ALREADY_PENDING: 'Accreditation check already in progress',
};

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const code = error.response?.data?.error?.code;
    if (code && ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code];
    }
    return (
      error.response?.data?.error?.message ||
      error.message ||
      'An unexpected error occurred'
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
