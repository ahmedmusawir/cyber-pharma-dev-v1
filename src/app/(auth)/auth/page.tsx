"use client";

import AuthTabs from "@/components/auth/AuthTabs";
import React, { Suspense } from "react";

const AuthPage = () => {
  return (
    <Suspense>
      <AuthTabs />
    </Suspense>
  );
};

export default AuthPage;
