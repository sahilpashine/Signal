import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AppDashboard from "./pages/AppDashboard";
import NewBrief from "./pages/NewBrief";
import BriefDetail from "./pages/BriefDetail";
import BriefsList from "./pages/BriefsList";
import SharedBrief from "./pages/SharedBrief";

function Router() {
  return (
    <Switch>
      {/* Public landing page */}
      <Route path="/" component={Home} />

      {/* Public shared brief view */}
      <Route path="/share/:token" component={SharedBrief} />

      {/* App routes (auth-gated inside each component) */}
      <Route path="/app" component={AppDashboard} />
      <Route path="/app/new" component={NewBrief} />
      <Route path="/app/briefs" component={BriefsList} />
      <Route path="/app/brief/:id" component={BriefDetail} />

      {/* 404 */}
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
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
