interface WeatherResultProps {
    weather: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | null;
    analysis: string;
}

const weatherIcons = {
    sunny: "☀️ 맑음",
    cloudy: "☁️ 흐림",
    rainy: "🌧️ 비",
    stormy: "🌩️ 폭풍",
    snowy: "❄️ 눈",
};

const weatherColors = {
    sunny: "from-yellow-100 to-orange-100 border-yellow-300",
    cloudy: "from-gray-100 to-slate-200 border-gray-300",
    rainy: "from-blue-100 to-indigo-200 border-blue-300",
    stormy: "from-purple-200 to-gray-400 border-purple-400",
    snowy: "from-white to-sky-100 border-sky-200",
};

export default function WeatherResult({ weather, analysis }: WeatherResultProps) {
    if (!weather || !analysis) return null;

    const gradientClass = weatherColors[weather] || "from-white to-gray-50 border-gray-200";

    return (
        <div className={`w-full max-w-2xl mx-auto my-8 p-6 rounded-2xl border-2 bg-gradient-to-br ${gradientClass} shadow-lg transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
            <div className="flex flex-col items-center justify-center mb-6">
                <h3 className="text-xl font-medium text-slate-600 mb-2">분석된 당신의 감정 날씨</h3>
                <div className="text-5xl font-bold text-slate-800 drop-shadow-sm">
                    {weatherIcons[weather] || "🌈 알 수 없음"}
                </div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 text-slate-700 leading-relaxed whitespace-pre-wrap">
                {analysis}
            </div>
        </div>
    );
}
