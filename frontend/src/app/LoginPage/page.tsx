"use client";
import React, { useState, useEffect } from "react";
import FormInput from "../components/FormElement";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/MainPage");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      // Custom event tetikle:
      window.dispatchEvent(new Event("authChange"));
      router.push("/MainPage");

    } catch (error: any) {
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="p-6 border rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Log In</h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
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
            className="bg-black text-white p-2 rounded-md mt-3 hover:bg-gray-600 transition w-full"
          >
            {loading ? "Loading..." : "Log In"}
          </button>
        </form>
        <Link href="/SignUpPage" className="text-blue-500 underline underline-offset-4 font-semibold block text-center mt-4">
          Don't have an account? Let's Sign Up!
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
