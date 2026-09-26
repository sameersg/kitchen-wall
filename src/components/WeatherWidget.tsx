import React, { useState, useEffect } from 'react';
import { 
  Sun, Cloud, CloudSun, CloudRain, CloudSnow, 
  CloudLightning, CloudDrizzle, CloudFog, Wind, 
  Droplets, RefreshCw, MapPin, Sparkles
} from 'lucide-react';

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    isDay: number;
  };
  daily: Array<{
    date: string;
    dayName: string;
    tempMax: number;
    tempMin: number;
    weatherCode: number;
    precipProb: number;
  }>;
}

interface WeatherWidgetProps {
  city: string;
  lat: number;
  lon: number;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ city, lat, lon }) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Wetterdaten konnten nicht geladen werden');
      const json = await res.json();

      const daysOfWeek = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
      const dailyForecast = (json.daily.time as string[]).slice(0, 5).map((timeStr: string, idx: number) => {
        const dateObj = new Date(timeStr);
        return {
          date: timeStr,
          dayName: idx === 0 ? 'Heute' : daysOfWeek[dateObj.getDay()],
          tempMax: Math.round(json.daily.temperature_2m_max[idx]),
          tempMin: Math.round(json.daily.temperature_2m_min[idx]),
          weatherCode: json.daily.weather_code[idx],
          precipProb: json.daily.precipitation_probability_max[idx] || 0
        };
      });

      setData({
        current: {
          temp: Math.round(json.current.temperature_2m),
          feelsLike: Math.round(json.current.apparent_temperature),
          humidity: json.current.relative_humidity_2m,
          windSpeed: Math.round(json.current.wind_speed_10m),
          weatherCode: json.current.weather_code,
          isDay: json.current.is_day
        },
        daily: dailyForecast
      });
    } catch (err) {
      console.error(err);
      setError('Wetter derzeit nicht verfügbar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

  const getWeatherIcon = (code: number, isDay: number = 1, size: string = 'w-6 h-6') => {
    if (code === 0) return <Sun className={`${size} text-[#d97706] animate-spin-slow`} />;
    if (code === 1 || code === 2) return <CloudSun className={`${size} text-[#f59e0b]`} />;
    if (code === 3) return <Cloud className={`${size} text-stone-400`} />;
    if (code === 45 || code === 48) return <CloudFog className={`${size} text-stone-400`} />;
    if (code >= 51 && code <= 55) return <CloudDrizzle className={`${size} text-sky-500`} />;
    if (code >= 61 && code <= 67) return <CloudRain className={`${size} text-sky-600`} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={`${size} text-indigo-400`} />;
    if (code >= 80 && code <= 82) return <CloudRain className={`${size} text-sky-500`} />;
    if (code >= 95) return <CloudLightning className={`${size} text-amber-500`} />;
    return <Cloud className={`${size} text-stone-400`} />;
  };

  const getWeatherDescription = (code: number): string => {
    if (code === 0) return 'Herrlicher Sonnenschein ☀️';
    if (code === 1) return 'Überwiegend sonnig & heiter';
    if (code === 2) return 'Teilweise heiter & mild';
    if (code === 3) return 'Gemütlich bewölkt';
    if (code === 45 || code === 48) return 'Morgendlicher Nebel';
    if (code >= 51 && code <= 55) return 'Sanfter Nieselregen';
    if (code >= 61 && code <= 65) return 'Regnerisch & gemütlich';
    if (code >= 71 && code <= 77) return 'Winterlicher Schneefall';
    if (code >= 80 && code <= 82) return 'Frische Regenschauer';
    if (code >= 95) return 'Sommerliches Gewitter';
    return 'Wechselhaft';
  };

  return (
    <div className="bg-white rounded-[28px] border border-[#ece7de] shadow-clean p-5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#ece7de]">
        <div className="flex items-center space-x-2 text-[#221e1a]">
          <MapPin className="w-4 h-4 text-[#e06236]" />
          <span className="font-bold text-sm tracking-tight text-[#221e1a]">{city}</span>
        </div>
        <button
          onClick={fetchWeather}
          disabled={loading}
          className="text-[#786f65] hover:text-[#221e1a] p-1 rounded-xl transition active:scale-95"
          title="Aktualisieren"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#e06236]' : ''}`} />
        </button>
      </div>

      {/* Main Weather Display */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-[#e06236]" />
        </div>
      ) : error ? (
        <div className="text-center py-6 text-rose-500 text-xs">{error}</div>
      ) : data ? (
        <div className="my-auto py-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-5xl font-bold tracking-tight text-[#221e1a]">{data.current.temp}</span>
                <span className="text-2xl font-medium text-[#e06236]">°C</span>
              </div>
              <p className="text-xs text-[#221e1a] font-medium mt-1">
                {getWeatherDescription(data.current.weatherCode)}
              </p>
              <p className="text-[11px] text-[#786f65] mt-0.5">
                Gefühlt wie {data.current.feelsLike}°C
              </p>
            </div>
            <div className="p-3.5 bg-[#faf8f4] rounded-2xl border border-[#ece7de]">
              {getWeatherIcon(data.current.weatherCode, data.current.isDay, 'w-10 h-10')}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#ece7de] text-[11px] text-[#554d44]">
            <div className="flex items-center space-x-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>{data.current.humidity}% Feuchtigkeit</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-[#15803d]" />
              <span>{data.current.windSpeed} km/h Brise</span>
            </div>
          </div>

          {/* 5-Day Forecast mini strip */}
          <div className="grid grid-cols-5 gap-1.5 mt-4 pt-3 border-t border-[#ece7de] text-center">
            {data.daily.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center p-1.5 rounded-xl bg-[#faf8f4] border border-[#ece7de]">
                <span className="text-[10px] font-semibold text-[#786f65] mb-1">{day.dayName}</span>
                <div className="my-0.5">
                  {getWeatherIcon(day.weatherCode, 1, 'w-4 h-4')}
                </div>
                <span className="text-[11px] font-bold text-[#221e1a] mt-1">{day.tempMax}°</span>
                <span className="text-[9px] text-[#786f65]">{day.tempMin}°</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
