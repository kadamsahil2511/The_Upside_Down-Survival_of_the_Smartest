import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, base } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
// Uses placeholder during build - set NEXT_PUBLIC_PROJECT_ID in your Vercel env vars
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'placeholder-project-id'

// Include Base so the app supports connecting on the Base network
export const networks = [base, mainnet, arbitrum]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig