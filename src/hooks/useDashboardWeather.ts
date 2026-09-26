import { useState, useEffect } from 'react';

interface WeatherSummary {
  temp: number;
  conditionText: string;
  tomorrowTemp: number;
  loading: boolean;
}

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Sonnig';
  if (code === 1 || code === 2) return 'Heiter';
  if (code === 3) return 'Bewölkt';
  if (code === 45 || code === 48) return 'Nebelig';
  if (code >= 51 && code <= 55) return 'Nieselregen';
  if (code >= 61 && code <= 67) return 'Regen';
  if (code >= 71 && code <= 77) return 'Schnee';
  if (code >= 80 && code <= 82) return 'Schauer';
  if (code >= 95) return 'Gewitter';
  return 'Bewölkt';
}

export function useDashboardWeather(lat: number = 52.52, lon: number = 13.405): WeatherSummary {
  const [weather, setWeather] = useState<WeatherSummary>({
    temp: 7,
    conditionText: 'Bewölkt',
    tomorrowTemp: 9,
    loading: false
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();

        if (isMounted && data.current && data.daily) {
          const currentTemp = Math.round(data.current.temperature_2m);
          const currentCode = data.current.weather_code;
          const tomorrowMax = Math.round(data.daily.temperature_2m_max?.[1] ?? currentTemp + 2);

          setWeather({
            temp: currentTemp,
            conditionText: getWeatherDescription(currentCode),
            tomorrowTemp: tomorrowMax,
            loading: false
          });
        }
      } catch {
        // Use default fallback if network / offline
      }
    }

    fetchWeather();
    const interval = setInterval(fetchWeather, 15 * 60 * 1000); // 15 mins
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lat, lon]);

  return weather;
}
