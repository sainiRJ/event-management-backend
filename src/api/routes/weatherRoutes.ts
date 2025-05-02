import { Router, Request, Response, NextFunction } from "express";
import { celebrate, Segments, Joi } from "celebrate";
import WeatherService from "../../services/weatherService";
import { RouteType } from "../../customTypes/expressTypes";

const route = Router();
const weatherService = new WeatherService();

const weatherRoute: RouteType = (apiRouter) => {
    apiRouter.use("/weather", route);
    
    route.get(
        "/city",
        celebrate({
            [Segments.QUERY]: Joi.object({
                city: Joi.string().required(),
                date: Joi.string().optional()
            })
        }),
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                const { city, date } = req.query as { city: string; date?: string };
                const weatherData = await weatherService.getWeatherByCity(city, date);
                res.status(200).json(weatherData);
            } catch (error) {
                next(error);
            }
        }
    );
};

export default weatherRoute;