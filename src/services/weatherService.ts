import axios from "axios";
import moment from "moment";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import { error } from "console";

export default class WeatherService {
	private readonly geoBaseUrl =
		process.env.GEO_BASE_URL || "https://nominatim.openstreetmap.org/search";
	private readonly weatherBaseUrl =
		process.env.WEATHER_BASE_URL || "https://api.open-meteo.com/v1/forecast";

	async getWeatherByCity(city: string, eventDate?: string) {
		try {
			// Step 1: Get Geolocation for City
			const geoResponse = await axios.get(this.geoBaseUrl, {
				params: {q: city, format: "json", limit: 1},
			});
			const responseError = {
				error: "LocationNotFound",
				message: `Location '${city}' not found`};

			if (!geoResponse.data.length) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					responseError,
				);
			}

			const {lat, lon, display_name} = geoResponse.data[0];

			// Step 2: Validate Event Date
			const today = moment().format("YYYY-MM-DD");
			let selectedDate = eventDate
				? moment(eventDate).format("YYYY-MM-DD")
				: today;

			if (moment(selectedDate).isBefore(today)) {
				selectedDate = today;
			}

			// Step 3: Fetch Weather Data
			const weatherResponse = await axios.get(this.weatherBaseUrl, {
				params: {
					latitude: lat,
					longitude: lon,
					timezone: "auto",
					daily: [
						"temperature_2m_max",
						"temperature_2m_min",
						"precipitation_probability_max",
					],
					hourly: ["temperature_2m", "wind_speed_10m", "weathercode"],
					start_date: selectedDate,
					end_date: selectedDate,
					current_weather: "true",
				},
			});

			const weatherError = {
				error: "UnavailableWeather",
				message: "Weather data unavailable for the selected date."
			}

			if (!weatherResponse.data.daily?.temperature_2m_max) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
					weatherError
				);
			}

			// Step 4: Extract Weather Details
			const maxTemp = weatherResponse.data.daily.temperature_2m_max[0];
			const minTemp = weatherResponse.data.daily.temperature_2m_min[0];
			const rainProbability =
				weatherResponse.data.daily.precipitation_probability_max[0];

			let currentWeather;
			if (selectedDate === today) {
				const {temperature, windspeed, weathercode} =
					weatherResponse.data.current_weather;
				currentWeather = {
					temperature: `${temperature}°C`,
					windSpeed: `${windspeed} km/h`,
					condition: this.getWeatherCondition(weathercode),
				};
			} else {
				const hourlyData = weatherResponse.data.hourly;
				const middayIndex = Math.floor(hourlyData.time.length / 2);
				currentWeather = {
					temperature: `${hourlyData.temperature_2m[middayIndex]}°C`,
					windSpeed: `${hourlyData.wind_speed_10m[middayIndex]} km/h`,
					condition: this.getWeatherCondition(
						hourlyData.weathercode[middayIndex]
					),
				};
			}

			// Step 5: Return Formatted Data
			const weatherData = {
				location: display_name,
				date: selectedDate,
				maxTemperature: `${maxTemp}°C`,
				minTemperature: `${minTemp}°C`,
				rainProbability: `${rainProbability}%`,
				current: currentWeather,
			};

			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				weatherData
			);
		} catch (error) {
			console.error("Weather API Error:", error || error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				// "Failed to fetch weather data. Please try again later."
			);
		}
	}

	private getWeatherCondition(code: number): string {
		const conditions: {[key: number]: string} = {
			0: "Clear Sky",
			1: "Mainly Clear",
			2: "Partly Cloudy",
			3: "Overcast",
			45: "Fog",
			48: "Rime Fog",
			51: "Drizzle: Light",
			53: "Drizzle: Moderate",
			55: "Drizzle: Heavy",
			61: "Rain: Slight",
			63: "Rain: Moderate",
			65: "Rain: Heavy",
			71: "Snow: Light",
			73: "Snow: Moderate",
			75: "Snow: Heavy",
			80: "Rain Showers: Slight",
			81: "Rain Showers: Moderate",
			82: "Rain Showers: Violent",
			95: "Thunderstorm: Slight",
			96: "Thunderstorm with Hail: Moderate",
			99: "Thunderstorm with Hail: Heavy",
		};
		return conditions[code] || "Unknown Condition";
	}
}
