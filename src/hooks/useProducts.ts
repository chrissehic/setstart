"use client"

import { useState, useEffect } from "react"
import { Product } from "@/types/workflow"
import { getProducts } from "@/actions/products/getProducts"
import { addProduct } from "@/actions/products/addProduct"
import { updateProduct } from "@/actions/products/updateProduct"
import { deleteProduct } from "@/actions/products/deleteProduct"
import { toast } from "sonner"

export function useProducts(workflowId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [workflowId])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const data = await getProducts(workflowId)
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  const createProduct = async (productData: {
    name: string
    description?: string
    type?: string
    image?: string
  }) => {
    try {
      setIsAdding(true)
      const newProduct = await addProduct({
        workflowId,
        ...productData,
      })
      setProducts((prev) => [newProduct, ...prev])
      toast.success("Product added successfully")
      return newProduct
    } catch (error) {
      console.error("Error creating product:", error)
      toast.error("Failed to add product")
      throw error
    } finally {
      setIsAdding(false)
    }
  }

  const updateProductById = async (
    productId: string,
    productData: {
      name?: string
      description?: string
      type?: string
      image?: string
    }
  ) => {
    try {
      setIsUpdating(true)
      const updatedProduct = await updateProduct(productId, productData)
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? updatedProduct : product
        )
      )
      toast.success("Product updated successfully")
      return updatedProduct
    } catch (error) {
      console.error("Error updating product:", error)
      toast.error("Failed to update product")
      throw error
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteProductById = async (productId: string) => {
    try {
      setIsDeleting(true)
      await deleteProduct(productId)
      setProducts((prev) => prev.filter((product) => product.id !== productId))
      toast.success("Product deleted successfully")
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Failed to delete product")
      throw error
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    products,
    isLoading,
    isAdding,
    isUpdating,
    isDeleting,
    createProduct,
    updateProductById,
    deleteProductById,
    refreshProducts: loadProducts,
  }
} 