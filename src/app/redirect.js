import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge'

// Pagina de redireccion del popup de Microsoft: entrega la respuesta a la ventana que abrio el
// popup (MSAL la cierra). Si se abre sin respuesta, no hay nada que hacer.
broadcastResponseToMainFrame().catch(() => {})
