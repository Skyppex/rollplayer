import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { getAuth } from 'firebase/auth';
import type { AppRouter } from '../../../backend/src/routes/index';

// Create the tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Function to get auth token
async function getAuthHeaders() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    return {
      authorization: `Bearer ${token}`,
    };
  }
  return {};
}

// Create tRPC client (simplified without WebSocket for now)
export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001',
      async headers() {
        return getAuthHeaders();
      },
    }),
  ],
});

// Vanilla tRPC client (for use outside React components)
export const vanillaTrpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001',
      async headers() {
        return getAuthHeaders();
      },
    }),
  ],
});