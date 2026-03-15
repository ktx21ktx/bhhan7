"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, Loader2, Info } from "lucide-react";

interface DiaryEntry {
    id: string;
    created_at: string;
    content: string;
    weather: string;
    analysis: string;
}

import { getWeatherIcon, getWeatherLabel } from "@/constants/weather";

export default function DiaryListView() {
    const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    useEffect(() => {
        const loadDiaries = async () => {
            const { data, error } = await supabase
                .from("diaries")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error && data) {
                setDiaries(data);
            }
            setIsLoading(false);
        };

        loadDiaries();
    }, [supabase]);

    const filteredDiaries = diaries.filter(diary => 
        diary.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        diary.analysis.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-sky-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Info className="w-5 h-5 text-sky-500" />
                        일기 기록 목록
                    </h2>
                    
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="일기 내용 검색..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 text-left">
                                <th className="py-3 px-4 text-sm font-semibold text-slate-500 w-32">작성일</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-500 w-20">날씨</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-500">일기 내용</th>
                                <th className="py-3 px-4 text-sm font-semibold text-slate-500">AI 분석</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDiaries.length > 0 ? (
                                filteredDiaries.map((diary) => (
                                    <tr key={diary.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                        <td className="py-4 px-4 text-sm text-slate-600 whitespace-nowrap">
                                            {format(new Date(diary.created_at), "yyyy-MM-dd HH:mm", { locale: ko })}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <span className="text-2xl" title={getWeatherLabel(diary.weather)}>
                                                {getWeatherIcon(diary.weather)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-sm text-slate-700 line-clamp-2 max-w-xs sm:max-w-md">
                                                {diary.content}
                                            </p>
                                        </td>
                                        <td className="py-4 px-4">
                                            <p className="text-xs text-sky-700 bg-sky-50 p-2 rounded-lg line-clamp-2">
                                                {diary.analysis}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-slate-400">
                                        검색 결과가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 text-xs text-slate-400">
                    * 전체 {filteredDiaries.length}개의 기록이 있습니다.
                </div>
            </div>
        </div>
    );
}
