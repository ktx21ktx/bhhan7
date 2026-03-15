"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import DiaryInput from "@/components/DiaryInput";
import WeatherResult from "@/components/WeatherResult";
import CalendarView from "@/components/CalendarView";
import DiaryListView from "@/components/DiaryListView";
import { createClient } from "@/utils/supabase/client";
import { BookOpen, CalendarDays, List } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"write" | "calendar" | "list">("write");
  const [result, setResult] = useState<{
    weather: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | null;
    analysis: string;
  }>({ weather: null, analysis: "" });

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

      // 2. Supabase DB 저장 (동일 날짜 기록 존재 시 업데이트, 없을 시 새로 저장)
      const supabase = createClient();
      
      // 현재 로그인 유저 정보 가져오기 (익명 포함)
      const { data: { user } } = await supabase.auth.getUser();
      const currentUserId = user?.id || null;

      // 오늘 날짜 범위 계산 (로컬 기준 00:00:00 ~ 23:59:59)
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

      // 1) 오늘 이미 작성된 일기가 있는지 확인
      const { data: existingRecords, error: searchError } = await supabase
        .from('diaries')
        .select('id')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd)
        .maybeSingle();

      if (searchError) console.error("기존 기록 조회 중 에러:", searchError);

      let dbResult;
      if (existingRecords) {
        // 2) 있다면 해당 기록 업데이트
        dbResult = await supabase
          .from('diaries')
          .update({
            content: text,
            weather: data.weather,
            analysis: data.analysis,
            created_at: new Date().toISOString() // 업데이트 시간으로 갱신
          })
          .eq('id', existingRecords.id);
        console.log("기본 기록을 최신 내용으로 업데이트했습니다.");
      } else {
        // 3) 없다면 새로 저장
        dbResult = await supabase
          .from('diaries')
          .insert([
            {
              user_id: currentUserId,
              content: text,
              weather: data.weather,
              analysis: data.analysis,
              created_at: new Date().toISOString()
            }
          ]);
        console.log("새로운 일기를 저장했습니다.");
      }

      if (dbResult.error) {
        console.error("DB 작업 에러:", dbResult.error);
        alert('분석 결과는 나왔으나 DB 저장에 실패했습니다: ' + dbResult.error.message);
      } else {
        console.log("일기가 성공적으로 처리되었습니다.");
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
      <Header />

      {/* 내비게이션 탭 */}
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-white/50 backdrop-blur-md rounded-xl shadow-sm mb-6 border border-slate-200 z-10">
        <button
          onClick={() => setViewMode("write")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
            viewMode === "write"
              ? "bg-sky-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          일기 쓰기
        </button>
        <button
          onClick={() => setViewMode("calendar")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
            viewMode === "calendar"
              ? "bg-sky-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          감정 달력
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
            viewMode === "list"
              ? "bg-sky-500 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <List className="w-4 h-4" />
          목록 보기
        </button>
      </div>

      {viewMode === "write" ? (
        <>
          <DiaryInput onSubmit={handleDiarySubmit} isLoading={isLoading} />
          <WeatherResult weather={result.weather} analysis={result.analysis} />
        </>
      ) : viewMode === "calendar" ? (
        <CalendarView />
      ) : (
        <DiaryListView />
      )}
    </main>
  );
}
