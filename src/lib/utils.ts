import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function clearUserDataAndRefresh() {
  try {
    // Sign out from Supabase (clears auth token and session)
    await supabase.auth.signOut();
    
    // Reload the page to refresh app state
    window.location.reload();
  } catch (error) {
    console.error("Error clearing user data:", error);
    // Still reload even if signOut fails
    window.location.reload();
  }
}
