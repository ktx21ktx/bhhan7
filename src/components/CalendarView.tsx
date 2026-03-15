import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";

interface DiaryEntry {
    id: string;
    created_at: string;
    content: string;
    weather: string;
    analysis: string;
}

const weatherIcons: Record<string, string> = {
    sunny: "☀️",
    cloudy: "☁️",
    rainy: "🌧️",
    stormy: "🌩️",
    snowy: "❄️",
};

export default function CalendarView() {
    const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const supabase = createClient();

    useEffect(() => {
        let isMounted = true;
        
        const loadDiaries = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                if (isMounted) setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("diaries")
                .select("*")
                .order("created_at", { ascending: false });

            if (isMounted) {
                if (!error && data) {
                    setDiaries(data);
                }
                setIsLoading(false);
            }
        };

        loadDiaries();
        
        return () => {
            isMounted = false;
        };
    }, [supabase]);



    const getDiaryForDay = (date: Date) => {
        return diaries.find(
            (d) => format(new Date(d.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        );
    };

    const selectedDiary = selectedDate ? getDiaryForDay(selectedDate) : undefined;

    // react-day-picker modifier for rendering weather icons
    const modifiers = {
        hasDiary: diaries.map((d) => new Date(d.created_at)),
    };

    const modifiersStyles = {
        hasDiary: {
            fontWeight: "bold",
            backgroundColor: "#e0f2fe", // sky-100
            color: "#0284c7", // sky-600
        },
    };

    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Calendar Section */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-sky-100 h-fit flex justify-center">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    className="my-0"
                    locale={ko}
                />
            </div>

            {/* Detail Section */}
            <div className="flex-1">
                {selectedDiary ? (
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-sky-100 h-full">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                            <div className="text-4xl">{weatherIcons[selectedDiary.weather]}</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {format(new Date(selectedDiary.created_at), "yyyy년 MM월 dd일", { locale: ko })}의 날씨
                                </h3>
                                <p className="text-sm text-slate-500 capitalize">{selectedDiary.weather} Day</p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">나의 일기</h4>
                            <p className="text-slate-700 whitespace-pre-wrap">{selectedDiary.content}</p>
                        </div>

                        <div>
                            <h4 className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">AI의 위로</h4>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap bg-sky-50 p-4 rounded-xl">
                                {selectedDiary.analysis}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/50 border border-dashed border-slate-300 rounded-2xl h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <CalendarIcon className="w-12 h-12 mb-4 opacity-50" />
                        <p>날짜를 선택하여 과거의 감정 날씨를 확인해보세요.</p>
                        <p className="text-sm mt-2 opacity-75">일기가 기록된 날짜는 하늘색으로 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
