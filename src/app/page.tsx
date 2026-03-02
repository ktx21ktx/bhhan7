"use client";

import { useState } from "react";
import Header from "@/components/Header";
import DiaryInput from "@/components/DiaryInput";
import WeatherResult from "@/components/WeatherResult";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    weather: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | null;
    analysis: string;
  }>({ weather: null, analysis: "" });

  const handleDiarySubmit = async (text: string) => {
    setIsLoading(true);
    setResult({ weather: null, analysis: "" });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diary: text }),
      });

      if (!response.ok) {
        throw new Error('의견을 분석하는 데 실패했습니다.');
      }

      const data = await response.json();
      setResult({
        weather: data.weather,
        analysis: data.analysis,
      });
    } catch (error) {
      console.error(error);
      alert('분석 중 오류가 발생했습니다. 환경변수 설정(.env.local)을 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <Header />
      <DiaryInput onSubmit={handleDiarySubmit} isLoading={isLoading} />
      <WeatherResult weather={result.weather} analysis={result.analysis} />
    </main>
  );
}
