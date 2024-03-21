export type DefaultResponse = {
  code: number;
  message: string;
};

export type ResponseType = {
  code: number;
  message: string;
  data?: string;
};

class BaseResponse {
  code: number;
  message: string;

  constructor(code: number, message: string) {
    this.code = code;
    this.message = message;
  }

  log(): ResponseType {
    console.log(`${this.code}: ${this.message}`);
    return {
      code: this.code,
      message: this.message
    };
  }
}

export class SuccessResponse extends BaseResponse {
  data: any;

  constructor(data: any) {
    super(200, 'Operazione completata con successo');
    this.data = data;
  }
}

export class ErrorResponse extends BaseResponse {
  errorDetails: any;

  constructor(errorDetails: any) {
    super(400, 'Si è verificato un errore');
    console.error(errorDetails);
    this.errorDetails = errorDetails;
  }

  log() {
    super.log();
    console.error(this.errorDetails);
    return {
      code: this.code,
      message: this.message,
      data: this.errorDetails
    };
  }
}

export function sendResponse(response: BaseResponse): ResponseType {
  return response.log();
}
