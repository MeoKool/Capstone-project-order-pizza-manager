"use client"

import { useState, useEffect, useCallback } from "react"
import type { CategoryModel } from "@/types/category"
import CategoryService from "@/services/category-service"

type SortOption = "CreatedDate desc" | "Name asc" | "Name desc"

const useCategories = () => {
  const [foodCategory, setFoodCategory] = useState<CategoryModel[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("CreatedDate desc")

  const fetchAllCategories = useCallback(
    async (sortOption: SortOption = sortBy) => {
      setLoading(true)
      setError(null)

      try {
        const categoryService = CategoryService.getInstance()
        const response = await categoryService.getAllCategories(sortOption)

        if (response.success && response.result.items && response.result.items.length > 0) {
          const categories = response.result.items
          setFoodCategory(categories)
        } else {
          setFoodCategory([])
        }
      } catch (err) {
        setError("Failed to fetch categories")
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [sortBy],
  )

  useEffect(() => {
    fetchAllCategories()
  }, [fetchAllCategories])

  const changeSortOrder = (newSortBy: SortOption) => {
    setSortBy(newSortBy)
    fetchAllCategories(newSortBy)
  }

  const getSortLabel = (sortOption: SortOption): string => {
    switch (sortOption) {
      case "CreatedDate desc":
        return "Mới nhất"
      case "Name asc":
        return "Tên: A-Z"
      case "Name desc":
        return "Tên: Z-A"
      default:
        return "Mới nhất"
    }
  }

  return {
    foodCategory,
    loading,
    error,
    sortBy,
    changeSortOrder,
    getSortLabel,
    refreshCategories: () => fetchAllCategories(sortBy),
  }
}

export default useCategories

