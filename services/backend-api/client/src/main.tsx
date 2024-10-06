import "./utils/i18n";
import React from "react";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
import theme from "./utils/theme";
import setupMockBrowserWorker from "./mocks/browser";
import { ForceDarkMode } from "./components/ForceDarkMode";
import { GlobalErrorBoundary } from "./components/GlobalErrorBoundary";
import App from "./App";
import { PricingDialogProvider } from "./contexts";
import { PaddleContextProvider } from "./contexts/PaddleContext";

async function prepare() {
  if (["development-mockapi"].includes(import.meta.env.MODE)) {
    await setupMockBrowserWorker().then((worker) => worker.start());
  } else {
    const DSN = import.meta.env.VITE_SENTRY_DSN;

    if (DSN) {
      Sentry.init({
        dsn: DSN,
        tunnel: "/api/v1/sentry-tunnel",
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.reactRouterV6BrowserTracingIntegration({
            useEffect: React.useEffect,
            useLocation,
            useNavigationType,
            createRoutesFromChildren,
            matchRoutes,
          }),
          Sentry.replayIntegration({
            maskAllText: false,
            blockAllMedia: false,
          }),
        ],
        tracesSampleRate: 0.2,
        // Session Replay
        replaysSessionSampleRate: 0.25, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
        replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
      });
    }
  }

  return Promise.resolve();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      // Invalidate cache after 30 minutes
      staleTime: 1000 * 60 * 30,
    },
  },
});

prepare().then(() => {
  const container = document.getElementById("root");

  if (!container) {
    throw new Error("Could not find root container");
  }

  const root = createRoot(container);

  // Do not use strict
  /**
   * Do not use strict mode since this breaks Chakra UI's modal, where the overlay does not
   * not get removed after closing the modal (making clicks on the page impossible).
   */
  root.render(
    // <React.StrictMode>
    <BrowserRouter>
      {/** Disable support widget since the iframe sometimes blocks forms */}
      {/* <SupportWidget /> */}
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <QueryClientProvider client={queryClient}>
          <ForceDarkMode>
            <GlobalErrorBoundary>
              <PaddleContextProvider>
                <PricingDialogProvider>
                  <App />
                </PricingDialogProvider>
              </PaddleContextProvider>
            </GlobalErrorBoundary>
          </ForceDarkMode>
        </QueryClientProvider>
      </ChakraProvider>
    </BrowserRouter>
    // </React.StrictMode>,
  );
});
