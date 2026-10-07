import { createContext, useContext } from 'react'
export const MotionContext = createContext({ enabled: true, toggle: () => {} })
export const useMotionPreference = () => useContext(MotionContext)
