// Parte del SDK de Sentry que se descarga aparte (ver monitoreo.js). Solo se reexporta lo que
// se usa para que el bundler deje fuera Replay, Feedback y el resto del SDK.
export { captureException, init } from '@sentry/react'
