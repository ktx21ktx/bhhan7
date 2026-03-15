export const WEATHER_METADATA = {
  sunny: {
    icon: "☀️",
    label: "맑음",
    color: "from-yellow-100 to-orange-100 border-yellow-300",
    text: "sunny",
  },
  cloudy: {
    icon: "☁️",
    label: "흐림",
    color: "from-gray-100 to-slate-200 border-gray-300",
    text: "cloudy",
  },
  rainy: {
    icon: "🌧️",
    label: "비",
    color: "from-blue-100 to-indigo-200 border-blue-300",
    text: "rainy",
  },
  stormy: {
    icon: "🌩️",
    label: "폭풍",
    color: "from-purple-200 to-gray-400 border-purple-400",
    text: "stormy",
  },
  snowy: {
    icon: "❄️",
    label: "눈",
    color: "from-white to-sky-100 border-sky-200",
    text: "snowy",
  },
  windy: {
    icon: "🌬️",
    label: "바람",
    color: "from-cyan-50 to-emerald-50 border-cyan-200",
    text: "windy",
  },
} as const;

export type WeatherType = keyof typeof WEATHER_METADATA;

export const getWeatherIcon = (weather: string | null) => {
  if (!weather || !(weather in WEATHER_METADATA)) return "🌈";
  return WEATHER_METADATA[weather as WeatherType].icon;
};

export const getWeatherLabel = (weather: string | null) => {
  if (!weather || !(weather in WEATHER_METADATA)) return "알 수 없음";
  return WEATHER_METADATA[weather as WeatherType].label;
};

export const getWeatherColor = (weather: string | null) => {
  if (!weather || !(weather in WEATHER_METADATA)) return "from-white to-gray-50 border-gray-200";
  return WEATHER_METADATA[weather as WeatherType].color;
};
