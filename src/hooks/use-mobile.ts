import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribeToViewport(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onStoreChange)

  return () => mql.removeEventListener("change", onStoreChange)
}

function getIsMobileSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT
}

function getServerIsMobileSnapshot() {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToViewport,
    getIsMobileSnapshot,
    getServerIsMobileSnapshot
  )
}
