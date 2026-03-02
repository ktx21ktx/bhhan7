"use client";

import { useState } from "react";

interface DiaryInputProps {
    onSubmit: (text: string) => void;
    isLoading: boolean;
}

export default function DiaryInput({ onSubmit, isLoading }: DiaryInputProps) {
    const [text, setText] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim() && !isLoading) {
            onSubmit(text);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto my-8">
            <textarea
                className="w-full p-4 rounded-xl border border-sky-200 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-sky-400 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400 text-slate-700 min-h-[200px]"
                placeholder="오늘 하루는 어땠나요? 당신의 감정을 솔직하게 적어주세요..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isLoading}
            />
            <div className="flex justify-end mt-4">
                <button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            날씨 분석 중...
                        </>
                    ) : (
                        "내 감정 날씨 확인하기"
                    )}
                </button>
            </div>
        </form>
    );
}
