import axios from 'axios';
import securityUtil from "../utils/securityUtil";
import {iGenericServiceResult} from "../customTypes/commonServiceTypes";
import serviceUtil from "../utils/serviceUtil";
import {httpStatusCodes} from "../customTypes/networkTypes";
import {genericServiceErrors} from "../constants/errors/genericServiceErrors";


export default class ChatService {
  private readonly gemmaEndpoint = 'http://localhost:11434/api/generate';

  public async generateResponse(message: string): Promise<iGenericServiceResult<any>> {
    try {
      const response = await axios.post(this.gemmaEndpoint, {
        model: 'gemma:2b',
        prompt: message,
        stream: false
      });

            return serviceUtil.buildResult(
              true,
              httpStatusCodes.SUCCESS_OK,
              null,
              response.data.response
            );
    } catch (error: any) {
      throw new Error(`Failed to generate chat response: ${error.message}`);
    }
  }
}