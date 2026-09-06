/** Auth service — wraps all /api/v1/auth/ endpoints */

const BASE = '/api/v1/auth';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface FaceAccountChoice {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface FaceLoginResponse {
  access?: string;
  refresh?: string;
  multiple_accounts?: boolean;
  accounts?: FaceAccountChoice[];
  detail?: string;
}

export interface ProfilePayload {
  avatar_url?: string;
  face_data?: string;
  face_verified?: boolean;
  preferred_language?: string;
  entrepreneur_type?: string;
  experience?: string;
  own_capital?: number | null;
  business_interest?: string;
  default_state?: number | null;
  default_district?: number | null;
  default_block?: number | null;
  default_village?: number | null;
}

/** POST /api/v1/auth/register/ */
export async function registerUser(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${BASE}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // DRF validation errors come as field-keyed objects or {detail: string}
    throw { status: res.status, data };
  }
}

/** POST /api/v1/auth/login/ — obtain JWT tokens */
export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, data };
  }

  return res.json();
}

/** POST /api/v1/auth/face-login/ — login via MediaPipe AI face detection */
export async function faceLogin(
  faceImage: string,
  username?: string,
  userId?: number
): Promise<FaceLoginResponse> {
  const res = await fetch(`${BASE}/face-login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ face_image: faceImage, username, user_id: userId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, data };
  }

  return res.json();
}

/** PATCH /api/v1/auth/profile/ — update user profile (requires auth token) */
export async function updateProfile(
  payload: ProfilePayload,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${BASE}/profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, data };
  }
}
