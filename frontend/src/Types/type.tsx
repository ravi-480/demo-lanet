// File: types/index.ts
export interface SliderImage {
  id: string;
  src: string;
  alt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export enum AuthActionTypes {
  LOGIN_REQUEST = "LOGIN_REQUEST",
  LOGIN_SUCCESS = "LOGIN_SUCCESS",
  LOGIN_FAILURE = "LOGIN_FAILURE",
  SIGNUP_REQUEST = "SIGNUP_REQUEST",
  SIGNUP_SUCCESS = "SIGNUP_SUCCESS",
  SIGNUP_FAILURE = "SIGNUP_FAILURE",
  LOGOUT = "LOGOUT",
  CLEAR_ERROR = "CLEAR_ERROR",
  CHECK_AUTH_STATUS = "CHECK_AUTH_STATUS",
}


export enum EventType {
  Wedding = "Wedding",
  Birthday = "Birthday",
  Corporate = "Corporate",
  Anniversary = "Anniversary",
  BabyShower = "Baby Shower",
  Engagement = "Engagement",
  Graduation = "Graduation",
  Festival = "Festival",
  Concert = "Concert",
  CharityGala = "Charity Gala",
  Farewell = "Farewell Party",
  Housewarming = "Housewarming",
  Workshop = "Workshop",
}

export const eventTypeOptions = Object.entries(EventType).map(([key, value]) => ({
  label: value,
  value: key.toLowerCase(),
}));


