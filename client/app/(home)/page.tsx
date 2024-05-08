"use client";

import { useRouter } from "next/navigation";

import UserHomePage from "@/components/UserHomePage";
import { getToken } from "@/utils/generalHelper";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = getToken();
    if (!!!token) {
      router.replace("/auth");
    }
  }, []);

  return <UserHomePage />;
}
