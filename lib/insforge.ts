import { createClient } from "@insforge/sdk";

export const insforge = createClient({
  baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
  anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
});

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: "free" | "pro" | "enterprise";
  credits: number;
  created_at: string;
  updated_at: string;
};

export type GenerationStyle = "baseball" | "idol" | "showme" | "street";

export type GenerationStatus =
  | "pending"
  | "generating_image"
  | "image_ready"
  | "generating_video"
  | "completed"
  | "failed";

export type Generation = {
  id: string;
  user_id: string;
  style: GenerationStyle;
  prompt: string;
  source_filename: string | null;
  generated_image_url: string | null;
  generated_image_key: string | null;
  generated_video_url: string | null;
  generated_video_key: string | null;
  status: GenerationStatus;
  error: string | null;
  created_at: string;
  updated_at: string;
};
