"use client";

import AuthForm from "@/components/forms/AuthForm";
import CustomToaster from "@/components/toasts/CustomToaster";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

const Home = () => {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/");
    }
  }, []);

  return (
    <>
      <CustomToaster />
      {/* <Toaster toastText="asads" toastType={EToastType.Error} /> */}
      <div className="overflow-x-hidden overflow-y-auto max-h-[90%] transform bg-blue">
        <AuthForm />
      </div>
    </>
  );
};

export default Home;
