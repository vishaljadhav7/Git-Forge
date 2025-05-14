"use client";

import { motion } from "framer-motion";
import { User, Mail, Lock, AlertCircle, Loader } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addUser } from "@/lib/features/user/userSlice";
import { useRouter } from 'next/navigation';

const signUpSchema = z.object({
  userName: z
    .string()
    .min(4, { message: "Username must be at least 4 characters" })
    .max(8, { message: "Username can be maximum 8 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

type FormField = z.infer<typeof signUpSchema>;

const SignUp = () => {
  
  const authStatus = useAppSelector((store) => store.user.isAuthenticated);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormField>({
    resolver: zodResolver(signUpSchema),
  });

 
  useEffect(() => {
    if (authStatus) {
      router.push("/dashboard");
    }
  }, [router, authStatus]);


  const onSubmit: SubmitHandler<FormField> = async (data) => {
   
    setApiError(null);
    setSuccess(false);

    try {
      
      signUpSchema.parse(data);

      
      const response = await axios.post(
        "http://localhost:4000/api/auth/sign-up",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.data) {
        dispatch(addUser(response.data.data));
        router.push("/dashboard");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
     
      if (error instanceof z.ZodError) {
        
        console.error("Validation error:", error.errors);
      } else if (error instanceof AxiosError) {
      
        const statusCode = error.response?.status;

        if (statusCode === 409) {
          setApiError("User with this email already exists");
        } else if (statusCode === 400) {
          setApiError(error.response?.data?.message || "Invalid input data");
        } else if (statusCode === 429) {
          setApiError("Too many attempts. Please try again later");
        } else {
        
          const errorMessage = error.response?.data?.message || error.message;
          setApiError(errorMessage || "An error occurred during sign up");
        }
      } else {

        setApiError((error as Error).message || "An unexpected error occurred");    
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-purple-600 mb-6 text-center">
          Sign Up
        </h1>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Registration successful!</p>
            <p>You will be redirected to the sign-in page shortly...</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{apiError}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="userName"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <User className="w-5 h-5 text-purple-600" />
                Username
              </label>
              <input
                {...register("userName")}
                type="text"
                id="userName"
                disabled={isSubmitting}
                className={`mt-1 w-full p-3 border ${
                  errors.userName ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition`}
                placeholder="Enter your username"
              />
              {errors.userName && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.userName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <Mail className="w-5 h-5 text-purple-600" />
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                id="email"
                disabled={isSubmitting}
                className={`mt-1 w-full p-3 border ${
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <Lock className="w-5 h-5 text-purple-600" />
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                id="password"
                disabled={isSubmitting}
                className={`mt-1 w-full p-3 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${
                isSubmitting
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white p-3 rounded-lg transition flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Sign Up"
              )}
            </motion.button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-purple-600 hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignUp;
