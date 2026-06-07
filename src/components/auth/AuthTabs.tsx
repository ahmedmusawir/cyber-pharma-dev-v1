"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

const AuthTabs = () => {
  const [selectedTab, setSelectedTab] = useState("login");

  return (
    <Tabs
      defaultValue="login"
      className="w-[400px] mt-16"
      onValueChange={setSelectedTab}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="login"
          className={`p-2 text-center bg-muted hover:bg-muted/80 ${
            selectedTab === "login"
              ? "border-2 border-primary"
              : "border-2 border-transparent"
          } rounded-md`}
        >
          Login
        </TabsTrigger>
        <TabsTrigger
          value="register"
          className={`p-2 text-center bg-muted hover:bg-muted/80 ${
            selectedTab === "register"
              ? "border-2 border-primary"
              : "border-2 border-transparent"
          } rounded-md`}
        >
          Register
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="login"
        className="p-4 border-t border-border bg-card"
      >
        <LoginForm />
      </TabsContent>
      <TabsContent
        value="register"
        className="p-4 border-t border-border bg-card"
      >
        <RegisterForm />
      </TabsContent>
    </Tabs>
  );
};

export default AuthTabs;
