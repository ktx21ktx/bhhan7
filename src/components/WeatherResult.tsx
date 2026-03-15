import { getWeatherColor, getWeatherIcon, getWeatherLabel } from "@/constants/weather";

interface WeatherResultProps {
    weather: "sunny" | "cloudy" | "rainy" | "stormy" | "snowy" | null;
    analysis: string;
}

export default function WeatherResult({ weather, analysis }: WeatherResultProps) {
    if (!weather || !analysis) return null;

    const gradientClass = getWeatherColor(weather);
    const icon = getWeatherIcon(weather);
    const label = getWeatherLabel(weather);

    return (
        <div className={`w-full max-w-2xl mx-auto my-8 p-6 rounded-2xl border-2 bg-gradient-to-br ${gradientClass} shadow-lg transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
            <div className="flex flex-col items-center justify-center mb-6">
                <h3 className="text-xl font-medium text-slate-600 mb-2">분석된 당신의 감정 날씨</h3>
                <div className="text-5xl font-bold text-slate-800 drop-shadow-sm flex items-center gap-2">
                    <span>{icon}</span>
                    <span>{label}</span>
                </div>
            </div>
            <div className="bg-white/60 backdrop-blur-md rounded-xl p-6 text-slate-700 leading-relaxed whitespace-pre-wrap shadow-inner">
                {analysis}
            </div>
        </div>
    );
}
