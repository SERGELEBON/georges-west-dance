// Style direction: Galerie Brutaliste Dorée — shell clair, parcours éditorial et navigation sans impasse.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./i18n";
import Home from "./pages/Home";
import ClassDetail from "./pages/ClassDetail";
import { lazy, Suspense } from "react";
import { ContentProvider } from "./lib/content";

// Admin is loaded only when visited, so visitors never download its code.
const Admin = lazy(() => import("./pages/Admin"));
const AdminRoute = () => <Suspense fallback={<div className="admin-loading">Loading…</div>}><Admin /></Suspense>;
function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Switch><Route path="/" component={Home} /><Route path="/admin" component={AdminRoute} /><Route path="/classes/private" component={ClassDetail} /><Route path="/classes/studio" component={ClassDetail} /><Route path="/classes/online" component={ClassDetail} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ContentProvider><LanguageProvider><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></LanguageProvider></ContentProvider></ErrorBoundary>;
}
