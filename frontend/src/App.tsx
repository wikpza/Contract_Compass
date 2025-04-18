
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import {guestRoutes, privateRoutes, publicRoutes} from "@/auth/routes.tsx";

const App = () => (
    <TooltipProvider>
      <Toaster />
      <Sonner />

        <Routes>

          {privateRoutes.map(value=>(
              <Route key={value.path} path={value.path} element={<Layout><value.element/></Layout>} />
          ))}

          {guestRoutes.map(value=>(
              <Route key={value.path} path={value.path} element={<value.element/>} />
          ))}

          {publicRoutes.map(value=>(
              <Route key={value.path} path={value.path} element={<value.element/>} />
          ))}


        </Routes>

    </TooltipProvider>
);

export default App;
