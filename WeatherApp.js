import React, { useState, useEffect } from "react";
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplet,
  MapPin,
  Search,
  Info,
} from "lucide-react";

const API_KEY = "db913918358091ee4d5bd2997a746517"; // Replace with your actual API key

const WeatherApp = () => {
  const [location, setLocation] = useState("New York");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cities, setCities] = useState([]);
  const [showInfo, setShowInfo] = useState(false);

  const fetchWeather = async (city) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error("Weather data not found");
      }
      const data = await response.json();
      setWeather(data);
      fetchForecast(city);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchForecast = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error("Forecast data not found");
      }
      const data = await response.json();
      const dailyForecast = data.list
        .filter((item, index) => index % 8 === 0)
        .slice(0, 5);
      setForecast(dailyForecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
      setForecast([]);
    }
  };

  const searchCities = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error("City data not found");
      }
      const data = await response.json();
      setCities(data);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    }
  };

  useEffect(() => {
    fetchWeather("New York");
  }, []);

  const handleSearch = () => {
    searchCities();
  };

  const handleCitySelect = (city) => {
    fetchWeather(`${city.name},${city.country}`);
    setCities([]);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  const getWeatherIcon = (iconCode) => {
    switch (iconCode) {
      case "01d":
      case "01n":
        return <Sun size={24} />;
      case "02d":
      case "02n":
      case "03d":
      case "03n":
      case "04d":
      case "04n":
        return <Cloud size={24} />;
      case "09d":
      case "09n":
      case "10d":
      case "10n":
        return <CloudRain size={24} />;
      default:
        return <Sun size={24} />;
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        Ryan Amir's Weather App
      </h1>
      <div style={{ display: "flex", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{ flex: 1, marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleSearch} style={{ padding: "5px 10px" }}>
          <Search size={18} />
        </button>
        <button
          onClick={toggleInfo}
          style={{ padding: "5px 10px", marginLeft: "10px" }}
        >
          <Info size={18} />
        </button>
      </div>

      {cities.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, marginBottom: "20px" }}>
          {cities.map((city, index) => (
            <li
              key={index}
              onClick={() => handleCitySelect(city)}
              style={{
                cursor: "pointer",
                padding: "5px",
                border: "1px solid #ddd",
                marginBottom: "5px",
              }}
            >
              {city.name}, {city.state}, {city.country}
            </li>
          ))}
        </ul>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {weather && !loading && !error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          <h2 style={{ display: "flex", alignItems: "center" }}>
            <MapPin size={18} style={{ marginRight: "5px" }} />
            {weather.name}, {weather.sys.country}
          </h2>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: "3rem", fontWeight: "bold" }}>
              {Math.round(weather.main.temp)}°F
            </div>
            <div>
              <p style={{ fontSize: "1.2rem" }}>
                {weather.weather[0].description}
              </p>
              <p style={{ display: "flex", alignItems: "center" }}>
                <Droplet size={18} style={{ marginRight: "5px" }} /> Humidity:{" "}
                {weather.main.humidity}%
              </p>
              <p style={{ display: "flex", alignItems: "center" }}>
                <Wind size={18} style={{ marginRight: "5px" }} /> Wind:{" "}
                {Math.round(weather.wind.speed)} mph
              </p>
            </div>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "10px",
          }}
        >
          {forecast.map((day, index) => (
            <div
              key={index}
              style={{
                textAlign: "center",
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "5px",
              }}
            >
              <p style={{ fontWeight: "bold" }}>
                {new Date(day.dt * 1000).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </p>
              {getWeatherIcon(day.weather[0].icon)}
              <p>{Math.round(day.main.temp)}°F</p>
            </div>
          ))}
        </div>
      )}

      {showInfo && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "5px",
          }}
        >
          <h3>Product Manager Accelerator Program</h3>
          <p>
            The Product Manager Accelerator Program is designed to support PM
            professionals through every stage of their career. From students
            looking for entry-level jobs to Directors looking to take on a
            leadership role, our program has helped over hundreds of students
            fulfill their career aspirations.
          </p>
          <p>
            Our Product Manager Accelerator community are ambitious and
            committed. Through our program they have learnt, honed and developed
            new PM and leadership skills, giving them a strong foundation for
            their future endeavours.
          </p>
          <p>
            Learn product management for free today on our{" "}
            <a
              href="https://www.youtube.com/c/drnancyli?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube channel
            </a>
          </p>
          <h4>Interested in PM Accelerator Pro?</h4>
          <ol>
            <li>
              Attend the Product Masterclass to learn more about the program
              details, price, different packages, and stay until the end to get
              FREE AI Course.
            </li>
            <li>
              Reserve your early bird ticket and submit an application to talk
              to our Head of Admission
            </li>
            <li>
              Successful applicants join our PMA Pro community to receive
              customized coaching!
            </li>
          </ol>
          <p>
            Learn how to create a killer product portfolio in two weeks that
            will help you land any PM job (traditional or AI) even if you were
            laid off or have zero PM experience
          </p>
          <p>
            <a
              href="https://www.drnancyli.com/masterclass"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.drnancyli.com/masterclass
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
