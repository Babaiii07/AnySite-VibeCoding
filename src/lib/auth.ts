/**
 * Client-side authentication utilities
 */

/**
 * Get the inference token from cookies
 * @returns Promise that resolves to the token string or throws an error if no token is found
 */
export async function getInferenceToken(): Promise<string> {
  // Get token from cookie
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((cookie) => cookie.startsWith("hf_token="));
  const token = tokenCookie?.split("=")[1];

  return token || "";
}
