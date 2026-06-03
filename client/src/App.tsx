/*
Design reminder for app shell: Editorial Afro-Modernism × Competitive Data Desk.
Keep the full report in a dark, premium analytical atmosphere so character data panels, savanna accents, and mono command notation remain visually consistent.
*/
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import ArchiveHome from "./pages/ArchiveHome";
import CharacterPage from "./pages/CharacterPage";
import "./lib/characters/elena";
import "./lib/characters/ingrid";

function Router() {
  return (
    <Switch>
      <Route path="/" component={ArchiveHome} />
      <Route path="/elena" component={() => <CharacterPage characterId="elena" />} />
      <Route path="/ingrid" component={() => <CharacterPage characterId="ingrid" />} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
