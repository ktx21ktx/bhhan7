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

import { getWeatherIcon, getWeatherLabel } from "@/constants/weather";

export default function CalendarView() {
    const [diaries, setDiaries] = useState<DiaryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const supabase = createClient();

    useEffect(() => {
        let isMounted = true;
        
        const loadDiaries = async () => {
            const { data, error } = await supabase
                .from("diaries")
                .select("*")
                .order("created_at", { ascending: false });

            if (isMounted) {
                if (!error && data) {
                    setDiaries(data);
                    // 데이터가 있으면 가장 최신 일기의 날짜를 초기 선택값으로 설정
                    if (data.length > 0) {
                        setSelectedDate(new Date(data[0].created_at));
                    }
                }
                setIsLoading(false);
            }
        };

        loadDiaries();
        
        return () => {
            isMounted = false;
        };
    }, [supabase]);



    const getLatestDiaryForDay = (date: Date) => {
        const dayDiaries = diaries.filter(
            (d) => format(new Date(d.created_at), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        );
        return dayDiaries.length > 0 ? dayDiaries[0] : undefined; // 최신순 정렬이므로 0번이 가장 최신
    };

    const selectedDiary = selectedDate ? getLatestDiaryForDay(selectedDate) : undefined;
    const dayDiariesCount = selectedDate ? diaries.filter(
        (d) => format(new Date(d.created_at), "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
    ).length : 0;

    // render day content with weather icon
    const renderDay = (day: Date) => {
        const diary = getLatestDiaryForDay(day);
        const dateStr = format(day, "d");
        
        return (
            <div className="relative flex flex-col items-center justify-center p-1 w-full h-full min-h-[40px]">
                <span className="text-xs mb-1">{dateStr}</span>
                {diary && (
                    <span className="text-lg leading-none" title={getWeatherLabel(diary.weather)}>
                        {getWeatherIcon(diary.weather)}
                    </span>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="w-full flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-8 mt-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Calendar Section */}
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-sm border border-sky-100 h-fit lg:w-[400px]">
                <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="m-0"
                    locale={ko}
                    components={{
                        Day: (dayProps: any) => {
                            const { day, ...buttonProps } = dayProps;
                            const diary = getLatestDiaryForDay(day.date);
                            const isSelected = selectedDate && format(day.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                            
                            return (
                                <button 
                                    {...buttonProps}
                                    onClick={() => setSelectedDate(day.date)}
                                    type="button"
                                    className={`relative flex flex-col items-center justify-center p-1 w-full h-[60px] cursor-pointer hover:bg-sky-50 transition-all rounded-xl border-2 ${
                                        isSelected ? "bg-sky-100/50 border-sky-400 shadow-sm" : "border-transparent"
                                    } ${day.outside ? "opacity-30" : "opacity-100"}`}
                                >
                                    <span className={`text-[10px] sm:text-xs mb-1 font-medium ${day.outside ? "text-slate-300" : "text-slate-600"}`}>
                                        {format(day.date, "d")}
                                    </span>
                                    {diary && (
                                        <span className="text-xl sm:text-2xl leading-none" title={getWeatherLabel(diary.weather)}>
                                            {getWeatherIcon(diary.weather)}
                                        </span>
                                    )}
                                </button>
                            );
                        }
                    }}
                />
            </div>

            {/* Detail Section */}
            <div className="flex-1">
                {selectedDiary ? (
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-sky-100 h-full">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
                            <div className="text-4xl">{getWeatherIcon(selectedDiary.weather)}</div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {format(new Date(selectedDiary.created_at), "yyyy년 MM월 dd일", { locale: ko })}의 날씨
                                </h3>
                                <p className="text-sm text-slate-500">
                                    {dayDiariesCount > 1 ? `오늘의 마지막 감정 (${getWeatherLabel(selectedDiary.weather)})` : getWeatherLabel(selectedDiary.weather)}
                                </p>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">나의 일기</h4>
                                {dayDiariesCount > 1 && (
                                    <span className="text-[10px] bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-medium">
                                        오늘 작성된 {dayDiariesCount}개의 일기 중 마지막 내용
                                    </span>
                                )}
                            </div>
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
                    <div className="bg-white/50 border border-dashed border-slate-300 rounded-2xl h-full min-h-[350px] flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <CalendarIcon className="w-12 h-12 mb-4 opacity-50" />
                        <p>날짜를 선택하여 과거의 감정 날씨를 확인해보세요.</p>
                        <p className="text-sm mt-2 opacity-75">일기가 기록된 날짜에는 감정 아이콘이 표시됩니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
