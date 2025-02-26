"use client";
import React, { useState } from "react";
import FormInput from "@/app/components/FormElement";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email,
          password: password,
          name,
          surname,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ Registration failed:", errorData);
        throw new Error(errorData.error || "Registration failed");
      }

      alert("✅ Registration successful! Please check your email for the verification code.");
      router.push(`/VerifyCodePage?email=${encodeURIComponent(email)}`);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-row justify-between h-full  bg-[url('/entryfull2.jpg')] bg-cover bg-center">
      <div className="flex flex-col justify-center content-center text-black w-1/3  ml-[13vh]">
        <p className="text-5xl font-bold">Why waste <br />your time?</p>
        <p className="text-2xl mt-9">
          With <span className="font-semibold">Google Maps Scraper</span>,<br /> you can access hundreds of <br /> business info in seconds.
        </p>
        <div className="flex gap-5 mt-[7vh] ">
          <Link href="/SignUpPage" className="flex content-center justify-center bg-black text-white font-semibold p-2 rounded-md hover:bg-gray-600 transition w-1/4">
            <button >Try For Free</button></Link>
          <Link href="https://www.konarworks.com/" target="_blank" rel="noopener noreferrer" className="flex content-center justify-center bg-transparent text-black p-2 font-semibold rounded-md border border-gray-900  hover:bg-gray-600 transition w-1/4">
            <button >Prices</button></Link>
        </div>
        <p className="flex text-gray-500 gap-2 mt-[15vh]">Google Maps Scrapper by
          <a href="https://www.konarworks.com/" target="_blank" rel="noopener noreferrer">
            <img src="/kwlogoblack.png" className="w-12" />
          </a>
        </p>
      </div>
      <div className="w-2/5 relative flex flex-col justify-center items-center">
        <div className="absolute bg-gray-600 bg-opacity-80 rounded-md">
          <div className="flex flex-col justify-center items-center">
            <div className="p-9 border rounded-lg shadow-md">
              <h2 className="text-2xl text-white font-bold mb-6">Sign Up - For Free</h2>
              {error && <p className="text-red-500">{error}</p>}
              <form onSubmit={handleSubmit} className="text-white">
                <FormInput
                  label="Name"
                  type="text"
                  placeholder="Enter your name"
                  name="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <FormInput
                  label="Surname"
                  type="text"
                  placeholder="Enter your surname"
                  name="Surname"
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                />
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  name="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormInput
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  name="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white font-semibold text-black p-2 rounded-md mt-4 hover:bg-gray-600 hover:text-white transition"
                >
                  {loading ? "Loading..." : "Sign Up"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
