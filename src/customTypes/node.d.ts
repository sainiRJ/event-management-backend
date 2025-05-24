declare namespace NodeJS {
	/*
		NOTE: The naming-convention rule has been disabled for this line because
		ProcessEnv is part of @types/node and can't be renamed to
		iProcessEnv
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export interface ProcessEnv {
		NODE_ENV: string;

		// Service Info
		SERVICE_NAME: string;

		PORT: string;

		HAS_CLUSTERING_ENABLED: string;

		// CORS Config
		CORS_ORIGIN: string;
		CORS_HTTP_METHODS: string;
		CORS_ALLOWED_HEADERS: string;
		CORS_CREDENTIALS: string;
		CORS_MAX_AGE: string;
		CORS_PREFLIGHT_CONTINUE: string;
		CORS_OPTIONS_SUCCESS_STATUS: string;

		// Swagger Config
		HAS_SWAGGER_ENABLED: string;
		SWAGGER_PORT: string;

		// Logging config
		LOG_LEVEL: string;
		LOGGING_TRANSPORT_FILE_LOGS_DIRECTORY: string;
		LOGGING_TRANSPORT_FILE_ERROR_LOG_FILE_NAME: string;
		LOGGING_TRANSPORT_FILE_WARN_LOG_FILE_NAME: string;
		LOGGING_TRANSPORT_FILE_INFO_LOG_FILE_NAME: string;
		LOGGING_TRANSPORT_FILE_HTTP_LOG_FILE_NAME: string;
		LOGGING_TRANSPORT_FILE_VERBOSE_LOG_FILE_NAME: string;
		LOGGING_TRANSPORT_FILE_DEBUG_LOG_FILE_NAME: string;
		LOGGING_TRANSPORT_FILE_SILLY_LOG_FILE_NAME: string;
		LOGGING_TRANSPORT_FILE_COMBINED_LOG_FILE_NAME: string;

		// Email Service Config
		// Transactional Email Config
		EMAIL_SERVICE_TRANSACTIONAL_SMTP_HOST: string;
		EMAIL_SERVICE_TRANSACTIONAL_SMTP_PORT: string;
		EMAIL_SERVICE_TRANSACTIONAL_SMTP_SECURE: string;
		EMAIL_SERVICE_TRANSACTIONAL_SMTP_USERNAME: string;
		EMAIL_SERVICE_TRANSACTIONAL_SMTP_FROM_ADDRESS: string;
		EMAIL_SERVICE_TRANSACTIONAL_SMTP_PASSWORD: string;

		// Marketing Email Config
		EMAIL_SERVICE_MARKETING_SMTP_HOST: string;
		EMAIL_SERVICE_MARKETING_SMTP_PORT: string;
		EMAIL_SERVICE_MARKETING_SMTP_SECURE: string;
		EMAIL_SERVICE_MARKETING_SMTP_USERNAME: string;
		EMAIL_SERVICE_MARKETING_SMTP_FROM_ADDRESS: string;
		EMAIL_SERVICE_MARKETING_SMTP_PASSWORD: string;

		// Database Config
		// All these will be defined inside the .env file
		DATABASE_USER: string;
		DATABASE_PASSWORD: string;
		DATABASE_HOST: string;
		DATABASE_PORT: number;
		DATABASE_NAME: string;
		DATABASE_CONNECTION_POOL_SIZE: number;
		DATABASE_CONNECTION_POOL_TIMEOUT: number;
		// this will be manually constructed and set by the src/config/index.ts
		DATABASE_URL: string;

		//AWS S3 Config
		AWS_ACCESS_KEY_ID: string;
		AWS_SECRET_ACCESS_KEY: string;
		AWS_REGION: string;
		AWS_S3_BUCKET_NAME: string;
		ADMIN_FRONTEND_URL: string;
		CLIENT_FRONTEND_URL: string;
	}
}
