/*
Design reminder for app shell: Editorial Afro-Modernism × Competitive Data Desk.
Keep the full report in a dark, premium analytical atmosphere so character data panels, savanna accents, and mono command notation remain visually consistent.
*/
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { trackPageView } from "@/lib/analytics";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ArchiveHome from "./pages/ArchiveHome";
import CharacterPage from "./pages/CharacterPage";
import ComboToolPage from "./pages/ComboToolPage";
import "./lib/characters/elena";
import "./lib/characters/ingrid";

function AnalyticsTracker() {
  const [location] = useLocation();

  useEffect(() => {
    const pagePath = `${location}${window.location.search}${window.location.hash}`;
    window.setTimeout(() => trackPageView(pagePath), 0);
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={ArchiveHome} />
      <Route path="/elena" component={() => <CharacterPage characterId="elena" />} />
      <Route path="/ingrid" component={() => <CharacterPage characterId="ingrid" />} />
      <Route path="/SF6_combo_tool" component={ComboToolPage} />
      <Route path="/sf6_combo_tool" component={ComboToolPage} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AnalyticsTracker />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
