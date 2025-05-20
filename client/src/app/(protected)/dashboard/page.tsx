'use client'

import React, { useState, FormEvent } from 'react'
import { z } from 'zod'
import Image from 'next/image'
import { useCreateProjectMutation } from '@/store/features/api'

const formSchema = z.object({
  projectName: z
    .string()
    .min(4, { message: 'Project name must be at least 4 characters' })
    .max(10, { message: 'Project name cannot exceed 10 characters' }),
  githubUrl: z
    .string()
    .regex(
      /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/?$/,
      { message: 'Invalid GitHub URL. Use format: https://github.com/<owner>/<repo>' }
    ),
  githubToken: z.string().optional(),
})

interface FormData {
  projectName: string
  githubUrl: string
  githubToken: string
}


interface Errors {
  projectName?: string
  githubUrl?: string
  githubToken?: string
}

const Dashboard: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    githubUrl: '',
    githubToken: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  
  const [createTask, { isLoading }] = useCreateProjectMutation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setErrors({})

    try {
    
      const validatedData = formSchema.parse({
        ...formData,
        githubUrl: formData.githubUrl.split('/').slice(0, 5).join('/'), 
      })

     
      console.log('Validated data:', validatedData)
 
      await createTask({project : validatedData}).unwrap() 

    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Errors = {}
        err.errors.forEach((error) => {
          fieldErrors[error.path[0] as keyof Errors] = error.message
        })
        setErrors(fieldErrors)
      } else {
        setSubmitError('An unexpected error occurred. Please try again.')
      }
    }
  }


  return (
    <div className="h-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl  rounded-lg flex flex-col md:flex-row items-center p-6 gap-6">
    
        <div className="relative w-42 h-42 flex-shrink-0">
          <Image
            src="https://images.unsplash.com/photo-1634907959510-1e2b0c519be1?q=80&w=1504"
            alt="GitHub repository"
            fill
            className="rounded-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 rounded-full"></div>
        </div>

        <div className="w-full md:w-96">
          <h2 className="text-xl font-bold text-gray-800">
            Link Your GitHub Repository
          </h2>
          <p className="text-gray-600 mt-2 mb-4 text-sm">
            Connect your GitHub repository to Git Forge by providing the repository URL and, if needed, a token for private repositories.
          </p>

          {submitError && (
            <div className="mb-3 p-2 bg-red-50 text-red-600 rounded-md text-xs">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="projectName" className="block text-xs font-medium text-gray-700">
                Project Name
              </label>
              <input
                id="projectName"
                name="projectName"
                type="text"
                value={formData.projectName}
                onChange={handleChange}
                placeholder="Project Name"
                className="mt-1 w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.projectName && (
                <p className="mt-1 text-xs text-red-600">{errors.projectName}</p>
              )}
            </div>

            <div>
              <label htmlFor="githubUrl" className="block text-xs font-medium text-gray-700">
                GitHub Repository URL
              </label>
              <input
                id="githubUrl"
                name="githubUrl"
                type="text"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/owner/repo"
                className="mt-1 w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.githubUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.githubUrl}</p>
              )}
            </div>

            <div>
              <label htmlFor="githubToken" className="block text-xs font-medium text-gray-700">
                GitHub Token (Optional)
              </label>
              <input
                id="githubToken"
                name="githubToken"
                type="text"
                value={formData.githubToken}
                onChange={handleChange}
                placeholder="GitHub token (Optional, for private repositories)"
                className="mt-1 w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.githubToken && (
                <p className="mt-1 text-xs text-red-600">{errors.githubToken}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full ${isLoading ? "bg-indigo-200" : "bg-indigo-600 cursor-pointer"} text-white py-1.5 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm `}
            >
              {isLoading ? "Creating new project....." : "Create Project"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Dashboard