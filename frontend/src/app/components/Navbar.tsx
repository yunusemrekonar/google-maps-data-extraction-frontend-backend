"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
const Navbar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener("authChange", checkAuth);
    return () => {
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  if (isLoggedIn === null) {
    return null;
  }

  const handleLogoClick = () => {
    router.push(isLoggedIn ? "/MainPage" : "/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("authChange"));
    router.push("/");
  };

  return (
    <div className="bg-black w-full h-16 flex justify-between items-center ">
    <div className="cursor-pointer ml-[12vh] w-auto" onClick={handleLogoClick}>
      <Image src="/logowhite.png" alt="logo" width={200} height={40} className="w-auto h-auto" />
    </div>
      <div className="flex gap-3 mr-[11vh]">
        <Link href="https://www.konarworks.com" target="_blank" rel="noopener noreferrer">
          <button className="text-black bg-white flex flex-row items-center gap-1 justify-center font-semibold rounded-md px-4 py-1 hover:bg-gray-600 hover:text-white transition">
          <ContactPhoneOutlinedIcon/>Contact Us
          </button>
        </Link>
        {isLoggedIn ? (
          <button onClick={handleLogout} className="flex flex-row items-center justify-center gap-1 text-black font-semibold  bg-white hover:bg-gray-600 hover:text-white transition rounded-md px-4 py-1">
           <LogoutOutlinedIcon/>Log Out
          </button>
        ) : (
          <Link href="/LoginPage">
            <button className="text-black bg-white font-semibold flex flex-row justify-center items-center gap-1 rounded-md hover:bg-gray-600 hover:text-white transition px-4 py-1">
            <PersonAddOutlinedIcon/>SignUp/LogIn
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
