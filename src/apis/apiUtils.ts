import api from './axiosConfig'
import type { AxiosResponse, AxiosError } from 'axios'

export default interface ApiResponse<T> {
  success: boolean
  result: T
  message: string
  statusCode: number
}
export type ApiErrorResponse = {
  error: {
    code: number
    message: string
    statusCode: number
    timestamp: string
    title: string
  }
}
export const get = async <T>(url: string, params?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.get(url, { params })
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      success: false,
      result: {} as T,
      message: axiosError.message,
      statusCode: axiosError.response?.status || 500
    }
  }
}

export const post = async <T>(url: string, data: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data)
    return response.data
  } catch (error) {
    const axiosError = error as ApiErrorResponse
    return {
      success: false,
      result: {} as T,
      message: axiosError.error.message || 'An unknown error occurred',
      statusCode: axiosError.error.statusCode || 500
    }
  }
}

export const put = async <T>(url: string, data?: object | string): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.put(url, data)
    return response.data
  } catch (error) {
    const axiosError = error as ApiErrorResponse
    return {
      success: false,
      result: {} as T,
      message: axiosError.error.message || ' Error put req',
      statusCode: axiosError.error?.code || 500
    }
  }
}

export const del = async <T>(url: string, data?: object): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.delete(url, data)
    return response.data
  } catch (error) {
    const axiosError = error as AxiosError
    return {
      success: false,
      result: {} as T,
      message: axiosError.message,
      statusCode: axiosError.response?.status || 500
    }
  }
}
