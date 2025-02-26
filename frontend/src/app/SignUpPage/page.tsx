"use client";
import React, { useState } from "react";
import FormInput from "@/app/components/FormElement";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SignUp = () => {
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
        const errData = await res.json();
        throw new Error(errData.error || "Registration failed");
      }

      alert("Registration successful! Please enter the verification code sent to your email.");
      router.push(`/VerifyCodePage?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center justify-center h-full">
      <div className="p-6 border rounded-lg shadow-md flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="text-gray-700">
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
          <button type="submit" disabled={loading} className="bg-black w-full text-white p-2 rounded-md mt-4 hover:bg-gray-600 transition">
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
        <Link href="/LoginPage" className="text-blue-500 font-semibold underline underline-offset-4 mt-4">
          Do you have an account? Let's Log In!
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
