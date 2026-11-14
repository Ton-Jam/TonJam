import { UserProfile } from "../types";
import { GUEST_USER_PROFILE } from "../lib/resetMockCache";

export const mockCurrentUser: UserProfile = { ...GUEST_USER_PROFILE };

export const mockUsers: UserProfile[] = [];
