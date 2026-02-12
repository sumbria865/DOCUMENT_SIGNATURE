import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";

import { Login } from "../pages/Auth/Login";
import { Register } from "../pages/Auth/Register";
import { Dashboard } from "../pages/Dashboard/Dashboard";

import { UploadDocument } from "../pages/Documents/UploadDocument";
import { MyDocuments } from "../pages/Documents/MyDocuments";
import { DocumentDetails } from "../pages/Documents/DocumentDetails";

import SignDocument from "../pages/Signing/SignDocument";
import SignComplete from "../pages/Signing/SignComplete";

/* ===========================
   🔐 PROTECTED ROUTE
=========================== */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/* ===========================
   🌐 PUBLIC ROUTE (AUTH PAGES)
=========================== */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/* ===========================
   🧱 APP LAYOUT
=========================== */
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

/* ===========================
   🚦 ROUTER
=========================== */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  /* ---------- AUTH ---------- */
  {
    path: "/login",
    element: (
      <Layout>
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Layout>
    ),
  },
  {
    path: "/register",
    element: (
      <Layout>
        <PublicRoute>
          <Register />
        </PublicRoute>
      </Layout>
    ),
  },

  /* ---------- DASHBOARD ---------- */
  {
    path: "/dashboard",
    element: (
      <Layout>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Layout>
    ),
  },

  /* ---------- DOCUMENTS ---------- */
  {
    path: "/documents",
    element: (
      <Layout>
        <ProtectedRoute>
          <MyDocuments />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/documents/upload",
    element: (
      <Layout>
        <ProtectedRoute>
          <UploadDocument />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: "/documents/:id",
    element: (
      <Layout>
        <ProtectedRoute>
          <DocumentDetails />
        </ProtectedRoute>
      </Layout>
    ),
  },

  /* ---------- ✍️ PUBLIC SIGNING (NO LAYOUT, NO AUTH) ---------- */
  {
    path: "/sign/:token",
    element: <SignDocument />,
  },
  {
    path: "/sign-complete",
    element: <SignComplete />,
  },
]);
