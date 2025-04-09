import {prisma} from "../prisma/prismaClient";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";
import securityUtil from "../utils/securityUtil";
import serviceUtil from "../utils/serviceUtil";
import { uploadImageToS3 } from "../utils/s3Util";
import {httpStatusCodes} from "../customTypes/networkTypes";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import { title } from "process";
import { create } from "domain";

export default class PhotoService {
    public async uploadPhoto(
        photoBodyDTO: {serviceId: string, file: Express.Multer.File| undefined} 
    ): Promise<iGenericServiceResult<any>> {
        try{
            /*
			verify service exist or not
			*/
			const serviceExist = await prisma.service.findUnique({
				where: {
					id: photoBodyDTO.serviceId
				}
			})
			if(!serviceExist){
				return serviceUtil.buildResult(
					false,
					httpStatusCodes.CLIENT_ERROR_NOT_FOUND, // Internal server error for any issues with Firebase or DB
					genericServiceErrors.generic.ServiceDoesNotExist
				);
			}
			if (!photoBodyDTO.file){
                return serviceUtil.buildResult(
                	false,
                	httpStatusCodes.CLIENT_ERROR_NOT_FOUND,
                	genericServiceErrors.generic.ImageDoesNotExist	
                )
            }
			const imageUrl = await uploadImageToS3(
				photoBodyDTO.file.buffer,
				photoBodyDTO.file.originalname,
				photoBodyDTO.file.mimetype
			  );
              let value = 0;
              value = value + 1;
            const photoResponse = await prisma.decorationPhoto.create({
                data: {
                    id: securityUtil.generateUUID(),
                    url: imageUrl,
                    title: `service-image-${value}`,
                    serviceId: photoBodyDTO.serviceId,
                    createdAt: new Date(),
                    updatedAt: new Date(),

                }	
            })
            return serviceUtil.buildResult(
                true,
                httpStatusCodes.SUCCESS_OK,
                null,
                photoResponse	
            )
        }
        catch(e){
			console.log(e);
            return serviceUtil.buildResult(
				true,
				httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR,
				genericServiceErrors.errors.SomethingWentWrong
			);
        }
    }

    public async getPhotos( ): Promise<iGenericServiceResult<any>> {
        try{
            const photos = await prisma.decorationPhoto.findMany({
                select: {
                    id: true,
                    url: true,
                    title: true,
                    service: {
						select: {
							id: true,
							serviceName: true
						}
					}
                }
            });
			const photoDetails: Record<string, { photoUrl: string; photoID: string; service: string }> = {};
			const ids: string[] = [];
			photos.forEach((photo) => {
				const serviceId = photo.service.id;
	
				if (!photoDetails[serviceId]) {
					photoDetails[serviceId] = {
						photoUrl: photo.url,
						photoID: photo.id,
						service: photo.service.serviceName
					};
					ids.push(serviceId);
				}
			});
            return serviceUtil.buildResult(
                true,
                httpStatusCodes.SUCCESS_OK,
                null,
                {ids, photoDetails}
            )
        }	catch(e){
        		console.log(e);
            return serviceUtil.buildResult(
            	true,
                httpStatusCodes.SERVER_ERROR_INTERNAL_SERVER_ERROR, // Internal server error for any issues with Firebase or DB
				genericServiceErrors.errors.SomethingWentWrong	
            )	
        }
    }
};





