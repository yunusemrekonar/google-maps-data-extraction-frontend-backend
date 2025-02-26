"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


const MainPage: React.FC = () => {
  const [query, setQuery] = useState(""); 
  const [count, setCount] = useState<number | "">("");
  const [filter, setFilter] = useState("default"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/LoginPage");
    } else {
      setIsLoggedIn(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/LoginPage");
  };

  const handleAddLink = async () => {
    setError("");
    if (query.trim() === "" || count === "" || count < 1 || count > 200) {
      setError("Lütfen geçerli bir arama sorgusu girin ve 1-200 arasında bir sayı belirleyin.");
      return;
    }

    setLoading(true);
    let formattedQuery = query;


    if (query.includes("google.com/maps")) {
      formattedQuery = extractSearchQuery(query);
    }

    try {
      console.log("Sending request to backend:", formattedQuery, "Filter:", filter);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },

        body: JSON.stringify({ link: formattedQuery, count: Number(count), filter }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Google Places API Result:", data);
      

      localStorage.setItem("scrapedData", JSON.stringify(data.businesses));
      router.push("/Results");
    } catch (error: any) {
      setError(error.message || "Backend bağlantısı başarısız!");
    } finally {
      setLoading(false);
    }
  };

  const extractSearchQuery = (url: string) => {
    try {
      const match = url.match(/search\/(.*?)\//);
      if (match && match[1]) {
        return decodeURIComponent(match[1]).replace(/\+/g, " ");
      }
    } catch (error) {
      console.error("Google Maps URL parse error:", (error as Error).message);
    }
    return "Unknown location";
  };

  return (
    <div className="flex flex-col items-center justify-center relative gap-4 p-5 h-full">
      <p className="text-[35px] font-semibold">Let's make a search</p>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Restaurants in Berlin Alexanderplatz"
        className="text-gray-900 border border-gray-300 rounded-md px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
      />
      <input
        type="number"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        placeholder="Number of businesses (Ex:20)"
        className="text-gray-900 border border-gray-300 rounded-md px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
        min="1"
        max="200"
      />
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="text-gray-900 border border-gray-300 rounded-md px-4 py-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
      >
        <option value="default">Default</option>
        <option value="most_reviews">Most Reviews</option>
        <option value="highest_rating">Highest Rating</option>
        <option value="five_star">5 Star Only</option>
      </select>
      <div className="flex flex-row gap-4">
        <button
          onClick={handleAddLink}
          className="w-full bg-black font-semibold text-white p-2 rounded-md mt-2 hover:bg-gray-600 transition"
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default MainPage;