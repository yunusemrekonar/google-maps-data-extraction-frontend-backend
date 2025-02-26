"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const VerifyCodePage = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
      } else {
        alert(data.message);
        router.push("/LoginPage");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">Enter Verification Code</h1>
      <form onSubmit={handleVerify} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          placeholder="Enter your email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded-md"
        />
        <input
          type="text"
          placeholder="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="p-2 border rounded-md"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </form>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </div>
  );
};

export default VerifyCodePage;
