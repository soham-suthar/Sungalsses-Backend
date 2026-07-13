import { z } from "zod";

const registerSchema = z.object({
  name: z
    .string({ required_error: "Please enter your name" })
    .trim()
    .min(6, "Username must be greater than 5 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Please enter a valid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(7, "Password must be at least 7 characters")
    .max(1024, "Password must not be greater than 1024 characters"),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email" })
    .trim()
    .email("Please enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

const addProductSchema = z.object({
  name: z
    .string({ required_error: "Please enter Product Name!" })
    .trim()
    .min(1, "Product name is required"),

  price: z.number().min(1, "Price must be greater than 0"),

  quantity: z.number().min(0, "Quantity cannot be negative"),

  color: z
    .string({ required_error: "Please enter the color" })
    .trim()
    .min(1, "Color is required"),

  src: z.string({ required_error: "Please enter the src" }).trim().min(1),

  hoverSrc: z
    .string({ required_error: "Please enter the hoverSrc" })
    .trim()
    .min(1),

  section: z
    .string({ required_error: "Please enter the section" })
    .trim()
    .min(1, "Section is required"),

  description: z
    .string({ required_error: "Please enter the description" })
    .trim()
    .min(5, "Description must be at least 5 characters"),
});

const updateProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").optional(),

  price: z.number().min(1, "Price must be greater than 0").optional(),

  quantity: z.number().min(0, "Quantity cannot be negative").optional(),

  color: z.string().trim().min(1, "Color is required").optional(),

  src: z.string().trim().min(1).optional(),

  hoverSrc: z.string().trim().min(1).optional(),

  section: z.string().trim().min(1, "Section is required").optional(),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .optional(),
});

export { registerSchema, loginSchema, addProductSchema, updateProductSchema };
