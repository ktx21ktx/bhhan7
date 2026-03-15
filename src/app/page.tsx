"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import DiaryInput from "@/components/DiaryInput";
import WeatherResult from "@/components/WeatherResult";
import AuthHeader from "@/components/AuthHeader";
import CalendarView from "@/components/CalendarView";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, CalendarDays } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"write" | "calendar">("write");
  const [result, setResult] = useState<{
    weather: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | null;
    analysis: string;
  }>({ weather: null, analysis: "" });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
    };
    checkAuth();
  }, []);

  const handleDiarySubmit = async (text: string) => {
    setIsLoading(true);
    setResult({ weather: null, analysis: "" });

    try {
      // 1. Gemini AI 서버로 분석 요청
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diary: text }),
      });

      if (!response.ok) throw new Error('의견을 분석하는 데 실패했습니다.');
      const data = await response.json();

      setResult({
        weather: data.weather,
        analysis: data.analysis,
      });

      // 2. Supabase 로그인 확인 후 DB 저장 (세션이 있을 경우에만)
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        await supabase.from('diaries').insert([
          {
            user_id: session.user.id,
            content: text,
            weather: data.weather,
            analysis: data.analysis
          }
        ]);
        console.log("일기가 성공적으로 DB에 저장되었습니다.");
      }

    } catch (error) {
      console.error(error);
      alert('분석 중 오류가 발생했습니다. 환경변수 설정이나 네트워크 상태를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center relative pb-24">
      <AuthHeader />
      <Header />

      {isAuthenticated && (
        <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-md rounded-xl shadow-sm mb-6 border border-slate-200">
          <button
            onClick={() => setViewMode("write")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${viewMode === "write"
                ? "bg-sky-500 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            <BookOpen className="w-4 h-4" />
            일기 쓰기
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${viewMode === "calendar"
                ? "bg-sky-500 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            <CalendarDays className="w-4 h-4" />
            감정 달력
          </button>
        </div>
      )}

      {viewMode === "write" ? (
        <>
          <DiaryInput onSubmit={handleDiarySubmit} isLoading={isLoading} />
          <WeatherResult weather={result.weather} analysis={result.analysis} />
          {!isAuthenticated && (
            <p className="mt-8 text-sm text-slate-500 bg-sky-50 px-4 py-2 rounded-lg">
              우측 상단 로그인 시 일기장 기록과 월별 감정 달력 기능을 사용할 수 있습니다!
            </p>
          )}
        </>
      ) : (
        <CalendarView />
      )}
    </main>
  );
}
