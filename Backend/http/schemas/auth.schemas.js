import {z} from "zod";
export const signupSchema = z.object({
    email:z.string().trim().toLowerCase().email("Invalid email format"),
    password:z
    .string()
    .min(4,"password should be minimum of 4 characters")
    .max(32,"password should not be exceed the length of 32 characters"),
    name:z
    .string()
    .trim()
    .min(2,"should contain minimum of 2 charactes")
    .max(32,"name should max contains 32 characters")
})
export const signinSchema =z.object({
    email:z.string().trim().lowercase().email("Invalid email format"),
    password:z
    
    .string()
    .trim()
    .min(4,"password should be minimum of 4 characters")
    .max(32,"password should not be exceed the length of 32 characters"),
    
})