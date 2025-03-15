import axios from "axios";
import moment from "moment";
import {httpStatusCodes} from "../customTypes/networkTypes";
import serviceUtil from "../utils/serviceUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";

export default class WeatherService {
	private readonly geoBaseUrl =
		process.env.GEO_BASE_URL || "https://nominatim.openstreetmap.org/search";
	private readonly weatherBaseUrl =
		process.env.WEATHER_BASE_URL || "https://api.open-meteo.com/v1/forecast";

	async getWeatherByCity(city: string, date?: string) {
		try {
			const geoResponse = await axios.get(this.geoBaseUrl, {
				params: {q: city, format: "json", limit: 1},
			});

			if (!geoResponse.data.length) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.errors.ResourceNotFound
				);
			}

			const {lat, lon, display_name} = geoResponse.data[0];
			const today = moment().format("YYYY-MM-DD");
			const selectedDate = date || today;

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

			if (!weatherResponse.data.daily?.temperature_2m_max) {
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.errors.ResourceNotFound
				);
			}

			const maxTemp = weatherResponse.data.daily.temperature_2m_max[0];
			const minTemp = weatherResponse.data.daily.temperature_2m_min[0];
			const rainProbability =
				weatherResponse.data.daily.precipitation_probability_max[0];

			let currentWeather;
			if (selectedDate === today) {
				const {temperature, windspeed} = weatherResponse.data.current_weather;
				currentWeather = {
					temperature: `${parseInt(temperature) * 2 + 30}°F`,
					windSpeed: `${windspeed} km/h`,
					condition: "Live Data",
				};
			} else {
				const hourlyData = weatherResponse.data.hourly;
				const middayIndex = Math.floor(hourlyData.time.length / 2);
				currentWeather = {
					temperature: `${parseInt(hourlyData.temperature_2m[middayIndex]) * 2 + 30}°F`,
					windSpeed: `${hourlyData.wind_speed_10m[middayIndex]} km/h`,
					condition: this.getWeatherCondition(
						hourlyData.weathercode[middayIndex]
					),
				};
			}

			const weatherData = {
				location: display_name,
				date: selectedDate,
				maxTemperature: `${parseInt(maxTemp) * 2 + 30}°F`,
				minTemperature: `${parseInt(minTemp) * 2 + 30}°F`,
				rainProbability: `${rainProbability}%`,
				current: currentWeather,
			};
			// Return successful result
			return serviceUtil.buildResult(
				true,
				httpStatusCodes.SUCCESS_OK,
				null,
				weatherData
			);
		} catch (error) {
			console.log(error);
			return serviceUtil.buildResult(
				false,
				httpStatusCodes.CLIENT_ERROR_BAD_REQUEST, // Internal server error for any issues with Firebase or DB
				genericServiceErrors.errors.SomethingWentWrong
			);
		}
	}

	private getWeatherCondition(code: number): string {
		const conditions: {[key: number]: string} = {
			0: "Clear Sky",
			1: "Mainly Clear",
			2: "Partly Cloudy",
			3: "Overcast",
			61: "Rain: Slight",
			63: "Rain: Moderate",
			65: "Rain: Heavy",
		};
		return conditions[code] || "Unknown Condition";
	}
}
