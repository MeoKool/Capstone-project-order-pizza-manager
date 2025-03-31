import { post, get } from '@/apis/apiUtils'
import { jwtDecode } from 'jwt-decode'

export interface LoginResponse {
  token: string
  expiration: string
}

export interface JwtPayload {
  AppUserId: string
  StaffId: string
  unique_name: string
  name: string
  role: string
  nbf: number
  exp: number
  iat: number
}

export interface StaffDetails {
  id: string
  username: string
  fullName: string
  phone: string
  email: string
  staffType: string
  status: string
}

class AuthService {
  private static instance: AuthService

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Login with username and password
   */
  public async login(username: string, password: string): Promise<StaffDetails> {
    try {
      // Step 1: Login and get token
      const loginResponse = await post<LoginResponse>('/auth/staff/login', { username, password })

      if (!loginResponse.success || !loginResponse.result?.token) {
        throw new Error(loginResponse.message || 'Login failed')
      }

      const token = loginResponse.result.token

      // Store token in sessionStorage for API calls
      sessionStorage.setItem('token', token)

      // Step 2: Decode the JWT token
      const decodedToken = jwtDecode<JwtPayload>(token)

      // Step 3: Fetch staff details using StaffId from the token
      const staffResponse = await get<StaffDetails>(`/staffs/${decodedToken.StaffId}`)

      if (!staffResponse.success || !staffResponse.result) {
        throw new Error(staffResponse.message || 'Failed to fetch staff details')
      }

      // Return only the staff details
      return staffResponse.result
    } catch (error) {
      console.error('Error during login process:', error)
      throw error
    }
  }
}

export default AuthService
