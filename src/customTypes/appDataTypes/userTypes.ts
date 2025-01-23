import {
	NullableString,
} from "../commonTypes";

export interface iGreetInputDTO {
	greeting: string;
}

export interface iUserRegisterDTO {
	firstName: NullableString;
	lastName:NullableString;
	email: string;
	mobile?: string;
	password: NullableString;
	confirmPassword: string;
}

export interface iUserRegisterResponse{
	name: NullableString;
	email: string;
	mobile?: string;
}

export interface iLoginForUser {
	email:string,
	password:string
}

export interface iUserDetailsResponse {
  firstName: string;
  lastName?: NullableString;
  email: string;
  mobile?: NullableString;
  address?: NullableString;
  profilePicture?: NullableString;
  role: string;
  username?: NullableString;        
  website?: NullableString;         
  description?: NullableString;     
  country?: NullableString;         
  timezone?: NullableString;        
  bio?: NullableString;             
  portfolios?: iPortfolio[] | null; // Array of iPortfolio objects or null
}

export interface iUserLoginResponse{
	id:string,
	user: iUserDetailsResponse,
	token: NullableString,
	refreshToken:NullableString
}

export interface iPortfolio{
	url: string
}

export interface iUserChangePasswordBody{
	currentPassword:string,
	newPassword:string,
	confirmedPassword:string,
	id:string 
}

export interface iUserChangePasswordResponse{
	message:string,
}


export interface iForgetPasswordResponseBody{
	message:string,
	otp:number
}

export interface iForgetPasswordRequestBody {
	email: string;
  }

  export interface iUserProfileResponse{
	id:string,
	user: iUserDetailsResponse,
}

export interface iResetPasswordRequestBody{
	email:string,
	password:string,
	otp: number,
}
  

export interface iUserCommonResponseType{
	message:string
}

export interface iLoginWithSocialAccountRequestBody{
	name:string,
	email:string,
	profilePicture:NullableString,
	mobile:NullableString,
	password:NullableString

}

export interface iCustomer {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    state: string;
    city: string;
    zip: string;
    address: string;
}

// Interface for customer response (for get and list requests)
export interface iCustomerResponse {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
    state: string;
    city: string;
    zip: string;
    address: string;
    created_at: string;
    updated_at: string;
}

export interface iCustomerRegisterDTO{
	email:string,
	password:string,
	confirmPassword:string

}